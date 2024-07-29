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

# Path definitions
RETRAIN_MODEL_SCRIPT = os.path.join(os.path.dirname(__file__), "retrain_model.py")
USER_FEEDBACK_FILE = os.path.join(os.path.dirname(__file__), "user_feedback.csv")


# Cache the model as a resource
@st.cache_resource()
def load_model():
    return get_caption_model()


# Get the model
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

    # Generate caption without noise
    pred_caption = generate_caption(image_path, caption_model)
    captions.add(pred_caption)

    # Generate captions with noise
    for _ in range(4):
        pred_caption = generate_caption(image_path, caption_model, add_noise=True)
        captions.add(pred_caption)

    # Ensure we have unique captions
    captions = list(captions)
    return captions


def save_image_to_tempfile(image):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        image.save(temp_file.name)
        return temp_file.name


st.title("Program do opisywania zdjęć")

# Initialize session state
if "image_path" not in st.session_state:
    st.session_state.image_path = None

if "captions" not in st.session_state:
    st.session_state.captions = []

if "selected_caption" not in st.session_state:
    st.session_state.selected_caption = None

if "caption_generated" not in st.session_state:
    st.session_state.caption_generated = False

if "generate_new" not in st.session_state:
    st.session_state.generate_new = False

if "translate" not in st.session_state:
    st.session_state.translate = False  # Default to English

# Option to choose translation language
translate_option = st.radio(
    "Chcesz przetłumaczyć napisy na polski?",
    options=["Tak", "Nie"],
    index=1 if not st.session_state.translate else 0,
)

# Update session state based on user selection
st.session_state.translate = translate_option == "Tak"

# Input for image URL
img_url = st.text_input(label="Wprowadź adres URL obrazu")

if img_url and not st.session_state.caption_generated:
    try:
        img = Image.open(requests.get(img_url, stream=True).raw)
        img = img.convert("RGB")
        st.session_state.image_path = save_image_to_tempfile(img)
        st.session_state.captions = []  # Clear previous captions
        st.session_state.caption_generated = False  # Reset caption generation flag
        st.session_state.generate_new = True  # Enable new caption generation
    except Exception as e:
        st.error(f"Error loading image from URL: {e}")

# OR upload an image
st.markdown('<center style="opacity: 70%">LUB</center>', unsafe_allow_html=True)
img_upload = st.file_uploader(label="Prześlij obraz", type=["jpg", "png", "jpeg"])

if img_upload and not st.session_state.caption_generated:
    try:
        img = Image.open(io.BytesIO(img_upload.read()))
        img = img.convert("RGB")
        st.session_state.image_path = save_image_to_tempfile(img)
        st.session_state.captions = []  # Clear previous captions
        st.session_state.caption_generated = False  # Reset caption generation flag
        st.session_state.generate_new = True  # Enable new caption generation
    except Exception as e:
        st.error(f"Error loading uploaded image: {e}")

# Generate captions if image path is available
if (
    st.session_state.image_path
    and st.session_state.generate_new
    and not st.session_state.caption_generated
):
    st.session_state.captions = generate_unique_captions(
        st.session_state.image_path, st.session_state.captions
    )
    st.session_state.caption_generated = True  # Mark that captions have been generated

if st.session_state.image_path:
    img = Image.open(st.session_state.image_path)
    st.image(img, caption="Uploaded Image")

if st.session_state.captions:
    st.markdown("#### Predicted subtitles:")

    # Display captions
    selected_caption_idx = st.radio(
        "Select the best description:",
        options=range(len(st.session_state.captions)),
        format_func=lambda x: translate_to_polish(st.session_state.captions[x])
        if st.session_state.translate
        else st.session_state.captions[x],
    )

    if st.button("Regenerate Captions"):
        st.session_state.captions = generate_unique_captions(
            st.session_state.image_path, st.session_state.captions
        )
        st.session_state.caption_generated = True  # Ensure captions are updated

    if st.button("Confirm your choice"):
        st.session_state.selected_caption = st.session_state.captions[
            selected_caption_idx
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
            st.write(result.stdout)  # Display standard output
        except subprocess.CalledProcessError as e:
            st.error(f"Error during model update: {e}")
            st.write(e.stderr)  # Display standard error

        st.session_state.image_path = None  # Clear the image path
        st.session_state.captions = []  # Clear the captions
        st.session_state.caption_generated = False  # Reset flag for future use
        st.session_state.generate_new = False  # Prevent generating new captions
