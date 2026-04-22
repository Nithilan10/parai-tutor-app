"""
Fine-tune pretrained AST (AudioSet) on Parai stroke classes in data/parai/.
Pretrained weights: MIT/ast-finetuned-audioset-10-10-0.4593 (download with download_pretrained.py).
"""
import os
import json

import numpy as np
import evaluate
from datasets import load_from_disk
from transformers import (
    AutoFeatureExtractor,
    AutoModelForAudioClassification,
    TrainingArguments,
    Trainer,
)

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CHECKPOINT = os.path.join(MODEL_DIR, "pretrained_checkpoints", "ast-audioset")
HUB_ID = "MIT/ast-finetuned-audioset-10-10-0.4593"


def resolve_checkpoint():
    if os.path.isdir(DEFAULT_CHECKPOINT) and os.path.isfile(
        os.path.join(DEFAULT_CHECKPOINT, "config.json")
    ):
        return DEFAULT_CHECKPOINT
    return HUB_ID


def main():
    train_dataset = load_from_disk(os.path.join(MODEL_DIR, "train_dataset"))
    test_dataset = load_from_disk(os.path.join(MODEL_DIR, "test_dataset"))
    with open(os.path.join(MODEL_DIR, "label_mappings.json"), "r", encoding="utf-8") as f:
        label_mappings = json.load(f)

    label2id = {str(k): int(v) for k, v in label_mappings["label2id"].items()}
    id2label = {int(k): str(v) for k, v in label_mappings["id2label"].items()}
    num_labels = len(label2id)

    ckpt = resolve_checkpoint()
    print("Checkpoint:", ckpt)

    feature_extractor = AutoFeatureExtractor.from_pretrained(ckpt)
    model = AutoModelForAudioClassification.from_pretrained(
        ckpt,
        num_labels=num_labels,
        label2id=label2id,
        id2label=id2label,
        ignore_mismatched_sizes=True,
    )

    max_samples = 32000

    def preprocess(batch):
        audios = [a["array"] for a in batch["audio"]]
        inputs = feature_extractor(
            audios,
            sampling_rate=feature_extractor.sampling_rate,
            max_length=max_samples,
            truncation=True,
            padding=True,
        )
        inputs["labels"] = batch["label"]
        return inputs

    encoded_train = train_dataset.map(
        preprocess,
        remove_columns=train_dataset.column_names,
        batched=True,
        batch_size=4,
    )
    encoded_eval = test_dataset.map(
        preprocess,
        remove_columns=test_dataset.column_names,
        batched=True,
        batch_size=4,
    )

    accuracy = evaluate.load("accuracy")

    def compute_metrics(eval_pred):
        logits = eval_pred.predictions
        preds = np.argmax(logits, axis=1)
        return accuracy.compute(predictions=preds, references=eval_pred.label_ids)

    out_name = "parai-ast-finetuned"
    args = TrainingArguments(
        output_dir=os.path.join(MODEL_DIR, out_name),
        evaluation_strategy="epoch",
        save_strategy="epoch",
        learning_rate=3e-5,
        per_device_train_batch_size=4,
        per_device_eval_batch_size=4,
        num_train_epochs=10,
        weight_decay=0.01,
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        push_to_hub=False,
        logging_steps=10,
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=encoded_train,
        eval_dataset=encoded_eval,
        tokenizer=feature_extractor,
        compute_metrics=compute_metrics,
    )

    print("Training…")
    trainer.train()

    save_path = os.path.join(MODEL_DIR, "parai-audio-model")
    trainer.save_model(save_path)
    feature_extractor.save_pretrained(save_path)
    print("Saved:", save_path)


if __name__ == "__main__":
    main()
