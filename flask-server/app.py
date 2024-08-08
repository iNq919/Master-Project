import io
import os
import sys
import tempfile
import streamlit as st
import requests
import subprocess
from PIL import Image
from model import get_caption_model, generate_caption
from translate import Translator

# Constants
MAX_LENGTH = 40
RETRAIN_MODEL_SCRIPT = os.path.join(os.path.dirname(__file__), "retrain_model.py")
USER_FEEDBACK_FILE = os.path.join(os.path.dirname(__file__), "user_feedback.csv")


# Initialize session state
def initialize_session_state():
    default_values = {
        "image_path": None,
        "captions": [],
        "selected_caption": None,
        "caption_generated": False,
        "translate": False,
        "selected_caption_index": 0,
        "generate_new": False,
    }
    for key, value in default_values.items():
        if key not in st.session_state:
            st.session_state[key] = value


initialize_session_state()


# Cache the model
@st.cache_resource()
def load_model():
    return get_caption_model()


caption_model = load_model()

# Initialize the translator
translator = Translator(to_lang="pl")


def translate_to_polish(text):
    try:
        return translator.translate(text)
    except Exception as e:
        st.error(f"Translation error: {e}")
        return text


def generate_unique_captions(image_path, previous_captions):
    captions = set(previous_captions)
    captions.add(generate_caption(image_path, caption_model))
    captions.update(
        generate_caption(image_path, caption_model, add_noise=True) for _ in range(4)
    )
    return list(captions)


def save_image_to_tempfile(image):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        image.save(temp_file.name)
        return temp_file.name


# Set up the app
st.title("Program do opisywania zdjęć")

# Translation option
st.session_state.translate = (
    st.radio(
        "Chcesz przetłumaczyć napisy na polski?",
        options=["Tak", "Nie"],
        index=1 if not st.session_state.translate else 0,
    )
    == "Tak"
)


# Load image from URL
def load_image_from_url(url):
    try:
        img = Image.open(requests.get(url, stream=True).raw).convert("RGB")
        st.session_state.image_path = save_image_to_tempfile(img)
        st.session_state.captions = []
        st.session_state.caption_generated = False
        st.session_state.generate_new = True
    except Exception as e:
        st.error(f"Error loading image from URL: {e}")


# Upload image
def load_image_from_upload(upload):
    try:
        img = Image.open(io.BytesIO(upload.read())).convert("RGB")
        st.session_state.image_path = save_image_to_tempfile(img)
        st.session_state.captions = []
        st.session_state.caption_generated = False
        st.session_state.generate_new = True
    except Exception as e:
        st.error(f"Error loading uploaded image: {e}")


# Input fields for image
img_url = st.text_input(label="Wprowadź adres URL obrazu")
img_upload = st.file_uploader(label="Prześlij obraz", type=["jpg", "png", "jpeg"])

if img_url and not st.session_state.caption_generated:
    load_image_from_url(img_url)

if img_upload and not st.session_state.caption_generated:
    load_image_from_upload(img_upload)

# Generate captions if needed
if st.session_state.image_path and st.session_state.generate_new:
    st.session_state.captions = generate_unique_captions(
        st.session_state.image_path, []
    )
    st.session_state.caption_generated = True
    st.session_state.generate_new = False

# Display image
if st.session_state.image_path:
    img = Image.open(st.session_state.image_path)
    st.image(img, caption="Uploaded Image")

# Regenerate captions button
if st.button("Regenerate Captions"):
    with st.spinner("Regenerating captions..."):
        st.session_state.captions = generate_unique_captions(
            st.session_state.image_path, st.session_state.captions
        )
        st.session_state.selected_caption_index = 0
        st.session_state.caption_generated = True

# Display captions
if st.session_state.captions:
    st.markdown("#### Predicted subtitles:")

    selected_caption_idx = st.radio(
        "Select the best description:",
        options=range(len(st.session_state.captions)),
        format_func=lambda x: translate_to_polish(st.session_state.captions[x])
        if st.session_state.translate
        else st.session_state.captions[x],
        index=st.session_state.selected_caption_index,
    )

    # Update index if user selects a new caption
    if st.session_state.selected_caption_index != selected_caption_idx:
        st.session_state.selected_caption_index = selected_caption_idx

    # Confirm choice button
    if st.button("Confirm your choice"):
        st.session_state.selected_caption = st.session_state.captions[
            st.session_state.selected_caption_index
        ]
        st.write(
            "Selected description:",
            translate_to_polish(st.session_state.selected_caption)
            if st.session_state.translate
            else st.session_state.selected_caption,
        )

        # Save selected caption to CSV
        with open(USER_FEEDBACK_FILE, "a") as f:
            f.write(
                f"{st.session_state.image_path},{st.session_state.selected_caption}\n"
            )

        # Retrain the model
        try:
            result = subprocess.run(
                [sys.executable, RETRAIN_MODEL_SCRIPT],
                check=True,
                capture_output=True,
                text=True,
            )
            st.success("The model has been updated based on your feedback!")
            st.write(result.stdout)
        except subprocess.CalledProcessError as e:
            st.error(f"Error during model update: {e}")
            st.write(e.stderr)

        # Reset session state
        st.session_state.image_path = None
        st.session_state.captions = []
        st.session_state.selected_caption = None
        st.session_state.selected_caption_index = 0
        st.session_state.caption_generated = False
        st.session_state.generate_new = False
