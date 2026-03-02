"""
Train beat classifier on adikuchi and sundukuchi data.
Uses same model architecture as training.py, generates fake data,
creates sundukuchi MP3 directory, and trains the model.
"""
import os
import numpy as np
import tensorflow as tf
import librosa

SAMPLE_RATE = 22050
DURATION = 1.0
N_MFCC = 40


def extract_features(file_path):
    y, sr = librosa.load(file_path, sr=SAMPLE_RATE, duration=DURATION)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=N_MFCC)
    return np.mean(mfcc.T, axis=0)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
SUNDUKUCHI_MP3_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "sundukuchi_mp3")
CLASSES = ["adikuchi", "sundukuchi"]
NUM_FAKE_SAMPLES = 50


def generate_fake_wav(output_path, frequency=220, duration=1.0, sample_rate=22050, seed=None):
    """Generate synthetic WAV file (drum-like tone)."""
    if seed is not None:
        np.random.seed(seed)
    t = np.linspace(0, duration, int(sample_rate * duration), dtype=np.float32)
    tone = np.sin(2 * np.pi * frequency * t) * 0.4
    decay = np.exp(-2 * t / duration)
    noise = np.random.randn(len(t)).astype(np.float32) * 0.05
    samples = (tone * decay + noise).astype(np.float32)
    samples = np.clip(samples, -1, 1)
    import scipy.io.wavfile
    scipy.io.wavfile.write(output_path, sample_rate, (samples * 32767).astype(np.int16))


def wav_to_mp3(wav_path, mp3_path):
    """Convert WAV to MP3 using pydub or ffmpeg."""
    try:
        from pydub import AudioSegment
        audio = AudioSegment.from_wav(wav_path)
        audio.export(mp3_path, format="mp3")
        return True
    except Exception:
        pass
    try:
        import subprocess
        subprocess.run(
            ["ffmpeg", "-y", "-i", wav_path, "-acodec", "libmp3lame", mp3_path],
            check=True, capture_output=True
        )
        return True
    except Exception:
        print("MP3 conversion skipped. Install pydub+ffmpeg or ffmpeg for MP3 output.")
        return False


def generate_fake_data():
    """Create data/adikuchi and data/sundukuchi with fake WAV files."""
    for label in CLASSES:
        folder = os.path.join(DATA_DIR, label)
        os.makedirs(folder, exist_ok=True)
        base_freq = 180 if label == "adikuchi" else 220
        for i in range(1, NUM_FAKE_SAMPLES + 1):
            path = os.path.join(folder, f"{label}{i}.wav")
            freq = base_freq + np.random.randint(-15, 15) if i > 1 else base_freq
            generate_fake_wav(path, frequency=freq, seed=i + ord(label[0]))
    print(f"Generated {NUM_FAKE_SAMPLES} fake WAV files per class in {DATA_DIR}")


def create_sundukuchi_mp3_directory():
    """Create directory of fake sundukuchi MP3 files (sundukuchi1.mp3, sundukuchi2.mp3, etc.)."""
    os.makedirs(SUNDUKUCHI_MP3_DIR, exist_ok=True)
    sundukuchi_dir = os.path.join(DATA_DIR, "sundukuchi")
    converted = 0
    for i in range(1, NUM_FAKE_SAMPLES + 1):
        wav_path = os.path.join(sundukuchi_dir, f"sundukuchi{i}.wav")
        mp3_path = os.path.join(SUNDUKUCHI_MP3_DIR, f"sundukuchi{i}.mp3")
        if os.path.exists(wav_path) and wav_to_mp3(wav_path, mp3_path):
            converted += 1
    if converted == 0:
        import shutil
        for i in range(1, NUM_FAKE_SAMPLES + 1):
            src = os.path.join(sundukuchi_dir, f"sundukuchi{i}.wav")
            dst = os.path.join(SUNDUKUCHI_MP3_DIR, f"sundukuchi{i}.wav")
            if os.path.exists(src):
                shutil.copy(src, dst)
        print(f"Created {SUNDUKUCHI_MP3_DIR} with WAV files (install ffmpeg for MP3)")
    else:
        print(f"Created {SUNDUKUCHI_MP3_DIR} with {converted} MP3 files")


def load_or_create_model():
    """Load existing model or create new one with same architecture."""
    model_path = os.path.join(MODEL_DIR, "parai_beat_classifier.h5")
    alt_path = os.path.join(os.path.dirname(__file__), "..", "model", "parai_beat_cnn.keras")

    if os.path.exists(model_path):
        try:
            model = tf.keras.models.load_model(model_path)
            if model.output_shape[-1] != len(CLASSES):
                print("Existing model has different output shape. Creating new model.")
                model = create_model()
        except Exception as e:
            print(f"Could not load model: {e}. Creating new model.")
            model = create_model()
    elif os.path.exists(alt_path):
        try:
            model = tf.keras.models.load_model(alt_path)
            if model.output_shape[-1] != len(CLASSES):
                model = create_model()
        except Exception:
            model = create_model()
    else:
        model = create_model()
    return model


def create_model():
    """Create model with same architecture as training.py."""
    return tf.keras.Sequential([
        tf.keras.layers.Dense(128, activation="relu", input_shape=(N_MFCC,)),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(64, activation="relu"),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(len(CLASSES), activation="softmax"),
    ])


def main():
    print("Generating fake adikuchi and sundukuchi data...")
    generate_fake_data()

    print("Creating sundukuchi MP3 directory...")
    create_sundukuchi_mp3_directory()

    print("Loading features...")
    X, y = [], []
    for idx, label in enumerate(CLASSES):
        folder = os.path.join(DATA_DIR, label)
        for f in os.listdir(folder):
            if f.endswith((".wav", ".mp3")):
                path = os.path.join(folder, f)
                try:
                    features = extract_features(path)
                    X.append(features)
                    y.append(idx)
                except Exception as e:
                    print(f"Skipping {path}: {e}")

    X = np.array(X)
    y = tf.keras.utils.to_categorical(y, num_classes=len(CLASSES))

    if len(X) == 0:
        raise ValueError("No training data found. Ensure data/adikuchi and data/sundukuchi have WAV files.")

    from sklearn.model_selection import train_test_split
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Loading or creating model...")
    model = load_or_create_model()
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])

    print("Training...")
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=30,
        batch_size=16,
    )

    os.makedirs(MODEL_DIR, exist_ok=True)
    out_path = os.path.join(MODEL_DIR, "adikuchi_sundukuchi_classifier.h5")
    model.save(out_path)
    print(f"Model saved to {out_path}")


if __name__ == "__main__":
    main()
