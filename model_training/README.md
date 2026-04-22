# Parai beat model (pretrained AST → fine-tuned)

## Pretrained model (downloaded from Hugging Face)

| Item | Value |
|------|--------|
| **Hub ID** | `MIT/ast-finetuned-audioset-10-10-0.4593` |
| **Architecture** | Audio Spectrogram Transformer (AST) |
| **Pretraining** | Fine-tuned on **Google AudioSet** (broad audio labels, strong for general sounds including percussion) |
| **Local cache** | Run `python download_pretrained.py` → `pretrained_checkpoints/ast-audioset/` |

## Data layout & provenance

See **`../data/DATA_SOURCES.md`**.

1. `npm run generate:audio` (repo root) — placeholder WAVs in `public/audio/`
2. `python bootstrap_parai_data.py` — copies + augments into `../data/parai/{big,small,both}/`
3. Add your **real Parai recordings** into those folders for production.

## Pipeline

```bash
cd model_training
python -m venv .venv && source .venv/bin/activate  # optional
pip install -r requirements.txt

# Optional: pin weights locally (otherwise first train() downloads from Hub)
python download_pretrained.py

# From repo root, ensure public/audio exists
cd .. && npm run generate:audio && cd model_training

python bootstrap_parai_data.py
python prepare_dataset.py
python train.py
```

Outputs:

- `train_dataset/`, `test_dataset/`, `label_mappings.json`
- `parai-ast-finetuned/` (checkpoints)
- `parai-audio-model/` (final saved model + feature extractor)

## Note on older scripts

Legacy TensorFlow MFCC training and adikuchi-only scripts were removed in favor of this Hugging Face AST pipeline.
