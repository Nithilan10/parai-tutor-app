import os
from datasets import Dataset, Audio
import glob

def create_audio_dataset(base_path):
    """Creates a Hugging Face Dataset from audio files in subdirectories."""
    audio_files = glob.glob(os.path.join(base_path, "**/*.wav"), recursive=True)
    
    if not audio_files:
        raise ValueError(f"No .wav files found in {base_path}")

    # Create a list of dictionaries
    data = []
    for file_path in audio_files:
        label = os.path.basename(os.path.dirname(file_path))
        data.append({"audio": file_path, "label": label})

    # Create a dictionary for the labels
    labels = sorted(list(set([d["label"] for d in data])))
    label2id = {label: i for i, label in enumerate(labels)}
    id2label = {i: label for i, label in enumerate(labels)}

    # Convert labels to integers
    for item in data:
        item["label"] = label2id[item["label"]]

    # Create the dataset
    dataset = Dataset.from_list(data)
    
    # Cast the audio column to the Audio feature type
    dataset = dataset.cast_column("audio", Audio(sampling_rate=16000))
    
    return dataset, label2id, id2label

if __name__ == '__main__':
    # The audio files are in subdirectories named after their labels
    # e.g., ../public/assets/audios/ku/ku_1.wav
    audio_path = "../public/assets/audios"
    
    try:
        full_dataset, label2id, id2label = create_audio_dataset(audio_path)
        
        print("Dataset created successfully!")
        print(f"Number of samples: {len(full_dataset)}")
        print(f"Features: {full_dataset.features}")
        print(f"First sample: {full_dataset[0]}")
        
        # Split the dataset into training and testing sets
        train_test_split = full_dataset.train_test_split(test_size=0.2)
        train_dataset = train_test_split["train"]
        test_dataset = train_test_split["test"]

        # Save the datasets and label mappings
        train_dataset.save_to_disk("train_dataset")
        test_dataset.save_to_disk("test_dataset")

        import json
        with open("label_mappings.json", "w") as f:
            json.dump({"label2id": label2id, "id2label": id2label}, f)
        
        print("\nTrain and test datasets saved to disk.")
        print(f"Training samples: {len(train_dataset)}")
        print(f"Testing samples: {len(test_dataset)}")
        print("Label mappings saved to label_mappings.json")

    except ValueError as e:
        print(f"Error: {e}")
