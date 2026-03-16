import os
import json
from datasets import load_from_disk
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification, TrainingArguments, Trainer
import numpy as np
import evaluate

# Load the datasets and label mappings
train_dataset = load_from_disk("train_dataset")
test_dataset = load_from_disk("test_dataset")
with open("label_mappings.json", "r") as f:
    label_mappings = json.load(f)

label2id = label_mappings["label2id"]
id2label = label_mappings["id2label"]
num_labels = len(label2id)

# Load the feature extractor and model
model_checkpoint = "microsoft/beats_ear_finetuned_as2m"
feature_extractor = AutoFeatureExtractor.from_pretrained(model_checkpoint)
model = AutoModelForAudioClassification.from_pretrained(
    model_checkpoint,
    num_labels=num_labels,
    label2id=label2id,
    id2label=id2label,
)

# Preprocess the data
def preprocess_function(examples):
    audio_arrays = [x["array"] for x in examples["audio"]]
    inputs = feature_extractor(
        audio_arrays, sampling_rate=feature_extractor.sampling_rate, max_length=16000, truncation=True
    )
    return inputs

train_dataset_encoded = train_dataset.map(preprocess_function, remove_columns="audio", batched=True)
test_dataset_encoded = test_dataset.map(preprocess_function, remove_columns="audio", batched=True)

# Define the evaluation metric
accuracy = evaluate.load("accuracy")

def compute_metrics(eval_pred):
    predictions = np.argmax(eval_pred.predictions, axis=1)
    return accuracy.compute(predictions=predictions, references=eval_pred.label_ids)

# Define the training arguments
model_name = model_checkpoint.split("/")[-1]
training_args = TrainingArguments(
    output_dir=f"{model_name}-finetuned-parai",
    evaluation_strategy="epoch",
    save_strategy="epoch",
    learning_rate=3e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=10,
    weight_decay=0.01,
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    push_to_hub=False,
)

# Create the trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset_encoded,
    eval_dataset=test_dataset_encoded,
    tokenizer=feature_extractor,
    compute_metrics=compute_metrics,
)

# Train the model
print("Starting model training...")
trainer.train()

# Save the fine-tuned model
final_model_path = "parai-audio-model"
trainer.save_model(final_model_path)
print(f"Model saved to {final_model_path}")
