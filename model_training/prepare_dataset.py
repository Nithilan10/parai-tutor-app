"""
Build Hugging Face datasets from data/parai/<class>/*.wav (and .mp3 if librosa can read).
"""
import os
import json
import glob

from datasets import Dataset, Audio

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_AUDIO_PATH = os.path.join(ROOT, "data", "parai")
OUT_DIR = os.path.dirname(os.path.abspath(__file__))


def create_audio_dataset(base_path):
    patterns = [
        os.path.join(base_path, "**", "*.wav"),
        os.path.join(base_path, "**", "*.mp3"),
    ]
    audio_files = []
    for p in patterns:
        audio_files.extend(glob.glob(p, recursive=True))

    audio_files = sorted(set(audio_files))
    if not audio_files:
        raise ValueError(
            f"No audio under {base_path}. Run: python model_training/bootstrap_parai_data.py"
        )

    data = []
    for file_path in audio_files:
        label = os.path.basename(os.path.dirname(file_path))
        data.append({"audio": file_path, "label": label})

    labels = sorted({d["label"] for d in data})
    label2id = {label: i for i, label in enumerate(labels)}
    id2label = {i: label for i, label in enumerate(labels)}

    for item in data:
        item["label"] = label2id[item["label"]]

    dataset = Dataset.from_list(data)
    dataset = dataset.cast_column("audio", Audio(sampling_rate=16_000))
    return dataset, label2id, id2label


if __name__ == "__main__":
    audio_path = os.environ.get("PARAI_AUDIO_DIR", DEFAULT_AUDIO_PATH)

    full_dataset, label2id, id2label = create_audio_dataset(audio_path)
    print("Dataset OK:", len(full_dataset), "samples")
    print("Labels:", label2id)

    split = full_dataset.train_test_split(test_size=0.2, seed=42)
    train_dataset = split["train"]
    test_dataset = split["test"]

    train_path = os.path.join(OUT_DIR, "train_dataset")
    test_path = os.path.join(OUT_DIR, "test_dataset")
    train_dataset.save_to_disk(train_path)
    test_dataset.save_to_disk(test_path)

    mappings_path = os.path.join(OUT_DIR, "label_mappings.json")
    with open(mappings_path, "w", encoding="utf-8") as f:
        json.dump({"label2id": label2id, "id2label": id2label}, f, indent=2)

    print("Saved:", train_path, test_path, mappings_path)
