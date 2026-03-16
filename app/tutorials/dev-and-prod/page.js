"use client";

import { useState } from "react";
import HandGestureRecognition from "@/components/HandGestureRecognition";

const targetBeat = ["theem", "ku", "tha", "ku", "ku", "tha", "ku", "ku", "tha", "ku"];

export default function DevAndProdPage() {
  const [playedBeats, setPlayedBeats] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);

  const handleGestureDetected = (gesture) => {
    if (gesture) {
      const newPlayedBeats = [...playedBeats, { gesture, correct: gesture === targetBeat[currentBeatIndex] }];
      setPlayedBeats(newPlayedBeats);
      if (gesture === targetBeat[currentBeatIndex]) {
        setCurrentBeatIndex(currentBeatIndex + 1);
      }
    }
  };

  const analyzeBeat = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tutorials/analyze-beat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetBeat, playedBeats }),
      });
      const data = await response.json();
      if (response.ok) {
        setFeedback(data.feedback);
      } else {
        setFeedback(data.error || "Failed to get feedback.");
      }
    } catch (error) {
      console.error("Error analyzing beat:", error);
      setFeedback("An error occurred while analyzing the beat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Dev and Prod Evidence
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            This page is for demonstrating the hand gesture recognition feature.
          </p>
        </div>

        <div className="mt-10">
          <div className="aspect-w-16 aspect-h-9">
            <HandGestureRecognition onGestureDetected={handleGestureDetected} />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900">Target Beat</h2>
            <p className="mt-2 text-lg text-gray-500">{targetBeat.join(" - ")}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900">Your Beat</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {playedBeats.map((beat, index) => (
                <span key={index} className={`text-lg font-bold px-3 py-1 rounded-full ${beat.correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {beat.gesture}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-yellow-100 p-6 rounded-lg shadow-lg border-2 border-yellow-400">
            <h2 className="text-2xl font-bold text-yellow-800">Next Beat</h2>
            <p className="mt-2 text-4xl font-extrabold text-yellow-900">{targetBeat[currentBeatIndex]}</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={analyzeBeat}
            disabled={loading || currentBeatIndex < targetBeat.length}
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400"
          >
            {loading ? "Analyzing..." : "Analyze Full Beat"}
          </button>
        </div>

        {feedback && (
          <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900">Feedback</h2>
            <p className="mt-2 text-lg text-gray-700">{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}
