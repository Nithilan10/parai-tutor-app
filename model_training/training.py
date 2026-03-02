import os
import numpy as np
import tensorflow as tf
import librosa 
import librosa.display


DATA_DIR = "data"
CLASSES = ["big","both","small"]
SAMPLE_RATE=22050
DURATION = 1.0
N_MFCC = 40

def extract_features(file_path): 
    y, sr = librosa.load(file_path, sr = SAMPLE_RATE, duration=DURATION)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=N_MFCC)
    mfcc_scaled = np.mean(mfcc.T, axis=0)
    return mfcc_scaled

X, y = [], []
for idx, label in enumerate(CLASSES):
    folder = os.path.join(DATA_DIR, label)
    for file in os.listdir(folder):
        if file.endswith(".wav"):
            path = os.path.join(folder, file)
            features = extract_features(path)
            X.append(features)
            y.append(idx)
X = np.array(X)
y = tf.keras.utils.to_categorical(y, num_classes=len(CLASSES))


from sklearn.model_selection import train_test_split
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size = 0.2, random_state=42)
model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation="relu", input_shape=(N_MFCC,)),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(64, activation="relu"),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(len(CLASSES), activation="softmax"),
    
])

model.compile(optimizer = "adam", loss = "categorical_crossentropy", metrics=["accuracy"])

history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=50,
    batch_size=16

)

os.makedirs("models", exist_ok=True)
model.save("model/parai_beat_classifier.h5")
print("model saved")
