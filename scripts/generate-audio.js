const fs = require("fs");
const path = require("path");

const AUDIO_DIR = path.join(__dirname, "..", "public", "audio");

function createMinimalWav(filename, frequency = 440) {
  const sampleRate = 44100;
  const duration = 0.3;
  const numSamples = Math.floor(sampleRate * duration);
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * blockAlign;
  const fileSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;

  const write = (data) => {
    if (Buffer.isBuffer(data)) {
      data.copy(buffer, offset);
      offset += data.length;
    }
  };

  buffer.write("RIFF", offset); offset += 4;
  buffer.writeUInt32LE(fileSize, offset); offset += 4;
  buffer.write("WAVE", offset); offset += 4;
  buffer.write("fmt ", offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;
  buffer.writeUInt16LE(1, offset); offset += 2;
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;
  buffer.write("data", offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.3 * 32767;
    buffer.writeInt16LE(Math.floor(sample), offset);
    offset += 2;
  }

  const outPath = path.join(AUDIO_DIR, filename);
  fs.writeFileSync(outPath, buffer);
  console.log("Created:", outPath);
}

function main() {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  const beats = [
    { file: "thi.mp3", freq: 200 },
    { file: "tha.mp3", freq: 250 },
    { file: "theem.mp3", freq: 180 },
    { file: "ku.mp3", freq: 220 },
    { file: "ka.mp3", freq: 240 },
  ];

  beats.forEach((b, i) => {
    const base = b.file.replace(".mp3", "");
    createMinimalWav(`${base}.wav`, b.freq);
  });

  console.log("Audio files generated.");
}

main();
