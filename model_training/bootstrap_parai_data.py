"""
Populate data/parai/{big,small,both} from project placeholder audio + light augmentation.
See ../data/DATA_SOURCES.md for data provenance.
"""
import os
import hashlib
import numpy as np

try:
    import librosa
    import soundfile as sf
except ImportError as e:
    raise SystemExit("Install librosa and soundfile: pip install librosa soundfile") from e

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_AUDIO = os.path.join(ROOT, "public", "audio")
OUT = os.path.join(ROOT, "data", "parai")

MAPPING = {
    "big": ["thi.wav", "ku.wav", "ka.wav"],
    "small": ["tha.wav"],
    "both": ["theem.wav"],
}

COPIES_PER_SOURCE = 8


def augment_write(y, sr, out_path, seed):
    rng = np.random.default_rng(seed)
    y = y.astype(np.float32)
    steps = rng.uniform(-1.5, 1.5)
    if abs(steps) > 0.05:
        y = librosa.effects.pitch_shift(y, sr=sr, n_steps=float(steps))
    noise = rng.normal(0, 0.012, size=y.shape)
    y = np.clip(y + noise.astype(np.float32), -1, 1)
    sf.write(out_path, y, sr)


def main():
    if not os.path.isdir(PUBLIC_AUDIO):
        raise SystemExit(f"Missing {PUBLIC_AUDIO}. Run: npm run generate:audio")

    for cls, files in MAPPING.items():
        d = os.path.join(OUT, cls)
        os.makedirs(d, exist_ok=True)
        n = 0
        for fname in files:
            src = os.path.join(PUBLIC_AUDIO, fname)
            if not os.path.isfile(src):
                print(f"Skip missing: {src}")
                continue
            base = os.path.splitext(fname)[0]
            y, sr = librosa.load(src, sr=16_000, mono=True)
            for i in range(COPIES_PER_SOURCE):
                out = os.path.join(d, f"{base}_{n:03d}.wav")
                seed_base = int(hashlib.md5(cls.encode(), usedforsecurity=False).hexdigest()[:8], 16)
                if i == 0:
                    sf.write(out, y, sr)
                else:
                    augment_write(y, sr, out, seed=n + seed_base)
                n += 1
        print(f"{cls}: wrote {n} files -> {d}")

    print("\nDone. Add real Parai WAVs into these folders for production accuracy.")


if __name__ == "__main__":
    main()
