from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
import os
import requests
from PIL import Image
from werkzeug.utils import secure_filename
from model import get_caption_model, generate_caption
from translate import Translator
import subprocess
import sys

app = Flask(__name__)
CORS(app)

# Constants
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
RETRAIN_MODEL_SCRIPT = os.path.join(os.path.dirname(__file__), "retrain_model.py")
USER_FEEDBACK_FILE = os.path.join(os.path.dirname(__file__), "user_feedback.csv")

# Ensure uploads directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

# Initialize translator
default_language = "pl"
translator = Translator(to_lang=default_language)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def generate_unique_captions(image_path, previous_captions, model):
    captions = set(previous_captions)
    captions.add(generate_caption(image_path, model))
    captions.update(
        generate_caption(image_path, model, add_noise=True) for _ in range(4)
    )
    return list(captions)


def save_image(file):
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)
    return filename  # Return the filename, not the full path


@app.route("/upload", methods=["POST"])
def upload_image():
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"status": "error", "message": "No selected file"}), 400
    if not allowed_file(file.filename):
        return jsonify({"status": "error", "message": "File type not allowed"}), 400

    filename = save_image(file)
    image_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    model = get_caption_model()
    captions = generate_unique_captions(image_path, [], model)
    return jsonify({"status": "success", "captions": captions, "image_path": filename})


@app.route("/fetch", methods=["POST"])
def fetch_image():
    url = request.json.get("url")
    if not url:
        return jsonify({"status": "error", "message": "No URL provided"}), 400

    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        img = Image.open(response.raw).convert("RGB")
        filename = secure_filename(os.path.basename(url))
        if not allowed_file(filename):
            return jsonify({"status": "error", "message": "File type not allowed"}), 400
        image_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        img.save(image_path)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    model = get_caption_model()
    captions = generate_unique_captions(image_path, [], model)
    return jsonify({"status": "success", "captions": captions, "image_path": filename})


@app.route("/regenerate", methods=["POST"])
def regenerate_captions():
    image_path = request.json.get("image_path")
    if not image_path:
        return jsonify(
            {"status": "error", "message": "Missing required data: 'image_path'"}
        ), 400

    model = get_caption_model()
    captions = generate_unique_captions(
        os.path.join(app.config["UPLOAD_FOLDER"], image_path), [], model
    )
    return jsonify({"status": "success", "captions": captions})


@app.route("/confirm", methods=["POST"])
def confirm_choice():
    data = request.json
    selected_caption = data.get("selected_caption")
    image_path = data.get("image_path")

    if not selected_caption or not image_path:
        return jsonify(
            {
                "status": "error",
                "message": "Missing required data: 'selected_caption' and/or 'image_path'",
            }
        ), 400

    try:
        with open(USER_FEEDBACK_FILE, "a") as f:
            f.write(f"{image_path},{selected_caption}\n")

        result = subprocess.run(
            [sys.executable, RETRAIN_MODEL_SCRIPT],
            check=True,
            capture_output=True,
            text=True,
        )
        return jsonify(
            {
                "status": "success",
                "message": "Model został zaktualizowany w oparciu o Twoją opinie!",
                "output": result.stdout,
            }
        )
    except subprocess.CalledProcessError as e:
        return jsonify(
            {"status": "error", "message": f"Error during model update: {e.stderr}"}
        ), 500


@app.route("/translate", methods=["POST"])
def translate_captions():
    data = request.json
    captions = data.get("captions")
    language = data.get("language", default_language)

    if not captions or not language:
        return jsonify(
            {
                "status": "error",
                "message": "Missing required data: 'captions' and/or 'language'",
            }
        ), 400

    try:
        translated_captions = [
            Translator(to_lang=language).translate(caption) for caption in captions
        ]
        return jsonify(
            {"status": "success", "translated_captions": translated_captions}
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/uploads/<filename>")
def serve_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"status": "error", "message": "File too large"}), 413


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0")
