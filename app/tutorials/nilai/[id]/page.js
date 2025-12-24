"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import {UploadBeatPage} from "../components/upload.js"

export default function Nilai1Page() {
  const [selectedBeat, setSelectedBeat] = useState(null);

  const beats = [
    { id: 1, name: "Thi", type: "Big Stick", audioUrl: "/audio/thi.mp3" },
    { id: 2, name: "Tha", type: "Small Stick", audioUrl: "/audio/tha.mp3" },
    { id: 3, name: "Theem", type: "Both Sticks", audioUrl: "/audio/theem.mp3" },
  ];

  const playAudio = (url) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-yellow-50 to-red-100">
      {/* HEADER */}
      <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-red-700">Nilai 1 – Introduction</h1>
        <p className="text-gray-600 mt-2">Learn the first set of beats in Parai</p>
      </div>

      {/* BEATS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 max-w-5xl mx-auto">
        {beats.map((beat) => (
          <div
            key={beat.id}
            className="bg-white/80 rounded-2xl shadow-lg p-6 text-center cursor-pointer hover:scale-105 transition"
            onClick={() => setSelectedBeat(beat)}
          >
            <h2 className="text-2xl font-bold text-gray-800">{beat.name}</h2>
            <p className="text-gray-500">{beat.type}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playAudio(beat.audioUrl);
              }}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 mx-auto"
            >
              <Play size={18} /> Play
            </button>
          </div>
        ))}
      </div>

      {/* PRACTICE MODE */}
      {selectedBeat && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-96 text-center shadow-xl">
            <h2 className="text-3xl font-bold text-red-700">{selectedBeat.name}</h2>
            <p className="text-gray-600">{selectedBeat.type}</p>

            {/* Placeholder for drum illustration */}
            <div className="w-40 h-40 mx-auto my-6 bg-gray-200 rounded-full flex items-center justify-center text-xl">
              🥁
            </div>

            <button
              onClick={() => playAudio(selectedBeat.audioUrl)}
              className="bg-red-600 text-white px-6 py-2 rounded-full flex items-center gap-2 mx-auto"
            >
              <Play size={18} /> Play Again
            </button>

            <UploadBeatPage></UploadBeatPage>

            <button
              onClick={() => setSelectedBeat(null)}
              className="mt-4 text-gray-600 underline"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* SEQUENCE SECTION */}
      <div className="mt-16 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Nilai 1 Sequence</h2>
        <p className="text-gray-500 mt-2">Thi → Tha → Theem</p>
        <button
          onClick={() => beats.forEach((b, i) =>
            setTimeout(() => playAudio(b.audioUrl), i * 1000)
          )}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full"
        >
          Play Full Sequence
        </button>
      </div>

      
      <div className="flex justify-between px-10 mt-20 pb-10">
        <button className="bg-gray-300 px-6 py-2 rounded-full">← Previous Nilai</button>
        <button className="bg-gray-800 text-white px-6 py-2 rounded-full">Next Nilai →</button>
      </div>
    </div>
  );
}
