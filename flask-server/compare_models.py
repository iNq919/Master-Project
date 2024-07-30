import os
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.models import load_model as tf_load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import streamlit as st

# Constants
NUM_SAMPLES = 100
IMAGE_SIZE = (256, 256)

# Path definitions
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH_CURRENT = os.path.join(
    SCRIPT_DIR, "saved_models", "image_captioning_coco_model.h5"
)
MODEL_PATH_UPDATED = os.path.join(
    SCRIPT_DIR, "saved_models", "image_captioning_updated_model.h5"
)


def generate_synthetic_data(num_samples, image_size=(256, 256)):
    synthetic_images = np.random.random((num_samples, *image_size, 3))
    synthetic_labels = np.random.randint(0, 2, num_samples)
    return synthetic_images, synthetic_labels


def create_synthetic_data_generator(num_samples, image_size=(256, 256)):
    synthetic_images, synthetic_labels = generate_synthetic_data(
        num_samples, image_size
    )
    datagen = ImageDataGenerator(rescale=1.0 / 255)
    generator = datagen.flow(synthetic_images, synthetic_labels, batch_size=32)
    return generator


def load_models(current_model_path, updated_model_path):
    if not os.path.isfile(current_model_path):
        raise FileNotFoundError(f"Current model file not found: {current_model_path}")
    if not os.path.isfile(updated_model_path):
        raise FileNotFoundError(f"Updated model file not found: {updated_model_path}")

    try:
        model_current = tf_load_model(current_model_path)
        model_updated = tf_load_model(updated_model_path)
    except Exception as e:
        raise RuntimeError(f"Error loading models: {e}")

    return model_current, model_updated


def evaluate_model(model, data_generator):
    loss, accuracy = model.evaluate(data_generator, verbose=0)
    return accuracy


def plot_comparison(accuracy_current, accuracy_updated):
    labels = ["Current Model", "Updated Model"]
    accuracies = [accuracy_current, accuracy_updated]
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.bar(labels, accuracies, color=["blue", "green"])
    ax.set_xlabel("Model")
    ax.set_ylabel("Accuracy")
    ax.set_title("Model Comparison")
    ax.set_ylim(0, 1)
    st.pyplot(fig)


def main():
    st.title("Model Comparison")

    # Load models and evaluate
    try:
        model_current, model_updated = load_models(
            MODEL_PATH_CURRENT, MODEL_PATH_UPDATED
        )
        data_generator = create_synthetic_data_generator(NUM_SAMPLES, IMAGE_SIZE)

        accuracy_current = evaluate_model(model_current, data_generator)
        accuracy_updated = evaluate_model(model_updated, data_generator)

        st.write(f"Current Model Accuracy: {accuracy_current:.2f}")
        st.write(f"Updated Model Accuracy: {accuracy_updated:.2f}")

        # Plot comparison
        plot_comparison(accuracy_current, accuracy_updated)

    except FileNotFoundError as e:
        st.error(f"Error: {e}")
    except RuntimeError as e:
        st.error(f"Runtime error: {e}")
    except Exception as e:
        st.error(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()
