from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import requests
from PIL import Image
from model import get_caption_model, generate_caption
from translate import Translator
import subprocess
import sys

app = Flask(__name__)
CORS(app)

# Constants
UPLOAD_FOLDER = "uploads"
RETRAIN_MODEL_SCRIPT = os.path.join(os.path.dirname(__file__), "retrain_model.py")
USER_FEEDBACK_FILE = os.path.join(os.path.dirname(__file__), "user_feedback.csv")

# Ensure uploads directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Initialize translator
translator = Translator(to_lang="pl")


def generate_unique_captions(image_path, previous_captions, model):
    captions = set(previous_captions)
    captions.add(generate_caption(image_path, model))
    captions.update(
        generate_caption(image_path, model, add_noise=True) for _ in range(4)
    )
    return list(captions)


def save_image(file):
    filename = file.filename
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
        img = Image.open(requests.get(url, stream=True).raw).convert("RGB")
        filename = os.path.basename(url)
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
                "message": "The model has been updated based on your feedback!",
                "output": result.stdout,
            }
        )
    except subprocess.CalledProcessError as e:
        return jsonify(
            {"status": "error", "message": f"Error during model update: {e.stderr}"}
        ), 500


@app.route("/uploads/<filename>")
def serve_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


if __name__ == "__main__":
    app.run(port=8501)
