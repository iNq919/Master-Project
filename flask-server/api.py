from flask import Flask, request, jsonify
from model import get_caption_model, generate_caption
from PIL import Image
import requests
import io
import os

app = Flask(__name__)

# Load the caption model
caption_model = get_caption_model()


@app.route("/", methods=["POST"])
def caption():
    data = request.json
    img_url = data.get("img_url")

    if not img_url:
        return jsonify({"error": "Image URL is required"}), 400

    try:
        # Download and process the image
        img = Image.open(requests.get(img_url, stream=True).raw)
        img = img.convert("RGB")
        img.save("tmp.jpg")

        # Generate caption
        caption_text = generate_caption("tmp.jpg", caption_model)

        # Clean up
        os.remove("tmp.jpg")

        return jsonify({"caption": caption_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
