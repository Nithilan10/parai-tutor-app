"""
Download AudioSet-finetuned AST checkpoint from Hugging Face for offline / pinned training.
Model: MIT/ast-finetuned-audioset-10-10-0.4593 (Audio Spectrogram Transformer, AudioSet pretrain).

Usage:
  pip install huggingface_hub
  python download_pretrained.py
"""
import os

from huggingface_hub import snapshot_download

REPO_ID = "MIT/ast-finetuned-audioset-10-10-0.4593"
LOCAL_DIR = os.path.join(os.path.dirname(__file__), "pretrained_checkpoints", "ast-audioset")


def main():
    os.makedirs(LOCAL_DIR, exist_ok=True)
    print(f"Downloading {REPO_ID} -> {LOCAL_DIR}")
    path = snapshot_download(
        repo_id=REPO_ID,
        local_dir=LOCAL_DIR,
        local_dir_use_symlinks=False,
    )
    print("Done:", path)


if __name__ == "__main__":
    main()
