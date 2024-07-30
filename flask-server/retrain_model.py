import os
import logging
import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import SparseCategoricalCrossentropy
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Constants
ROOT_DIR = os.path.dirname(__file__)
FEEDBACK_FILE = os.path.join(ROOT_DIR, "user_feedback.csv")
MODEL_DIR = os.path.join(ROOT_DIR, "saved_models")
MODEL_PATH = os.path.join(MODEL_DIR, "model_updated.h5")
VOCAB_SIZE = 10000  # Adjust based on your vocabulary size
MAX_SEQUENCE_LENGTH = 100  # Adjust based on your sequence length


def preprocess_feedback(feedback_df):
    tokenizer = Tokenizer(num_words=VOCAB_SIZE)

    # Example: Tokenize captions
    tokenizer.fit_on_texts(feedback_df["caption"])
    sequences = tokenizer.texts_to_sequences(feedback_df["caption"])
    data = pad_sequences(sequences, maxlen=MAX_SEQUENCE_LENGTH)

    # Example: Convert labels to numpy array
    labels = np.array(
        feedback_df["label"]
    )  # Adjust this line based on your labels format

    return data, labels


def retrain_model():
    try:
        # Check if the feedback file exists
        if not os.path.exists(FEEDBACK_FILE):
            logging.error("Feedback file does not exist.")
            return

        # Load user feedback
        feedback_df = pd.read_csv(FEEDBACK_FILE)
        if feedback_df.empty:
            logging.error("Feedback file is empty.")
            return

        # Preprocess feedback data
        X_train, y_train = preprocess_feedback(feedback_df)

        # Load the existing model
        model = load_model(MODEL_PATH)
        model.compile(optimizer=Adam(), loss=SparseCategoricalCrossentropy())

        # Retrain the model
        model.fit(X_train, y_train, epochs=3, batch_size=32, validation_split=0.2)

        # Save updated weights
        os.makedirs(MODEL_DIR, exist_ok=True)
        model.save(MODEL_PATH)

        logging.info("Model retrained and updated weights saved successfully.")

    except Exception as e:
        logging.error(f"An error occurred: {e}")


if __name__ == "__main__":
    retrain_model()
