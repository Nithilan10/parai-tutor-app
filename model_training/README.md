# Parai Audio Model Training

This directory contains the scripts to train a custom audio classification model to recognize the "ku," "tha," and "theem" drum sounds.

## Setup

1.  **Install Dependencies:**
    First, you need to install the necessary Python libraries. It is highly recommended to do this in a virtual environment.

    ```bash
    pip install -r requirements.txt
    ```

## Data

The training data should be placed in the `public/assets/audios` directory. The audio files should be organized into subdirectories named after their corresponding labels. For example:

```
public/assets/audios/
├── ku/
│   ├── ku_1.wav
│   └── ku_2.wav
├── tha/
│   ├── tha_1.wav
│   └── tha_2.wav
└── theem/
    ├── theem_1.wav
    └── theem_2.wav
```

## Training Process

The training process is divided into two main steps:

1.  **Prepare the Dataset:**
    This script loads the audio files, creates a Hugging Face Dataset, and splits it into training and testing sets.

    ```bash
    python prepare_dataset.py
    ```

    This will create two directories, `train_dataset` and `test_dataset`, and a `label_mappings.json` file.

2.  **Train the Model:**
    This script loads the prepared datasets, fine-tunes the pre-trained BEATs model, and saves the final model.

    ```bash
    python train.py
    ```

    This will create a new directory called `parai-audio-model` containing the fine-tuned model and tokenizer.
