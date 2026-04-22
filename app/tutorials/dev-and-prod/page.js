"use client";

import { useState } from "react";
import Image from "next/image";
import HandGestureRecognition from "@/components/HandGestureRecognition";
import ParaiFeedbackPanel from "@/components/ParaiFeedbackPanel";
import { decorImagery } from "@/lib/localImagery";

const targetBeat = ["theem", "ku", "tha", "ku", "ku", "tha", "ku", "ku", "tha", "ku"];

export default function DevAndProdPage() {
  const [playedBeats, setPlayedBeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [report, setReport] = useState(null);
  const [narrative, setNarrative] = useState("");
  const [usedAI, setUsedAI] = useState(false);
  const [idealGapMs, setIdealGapMs] = useState(600);

  const handleGestureDetected = (payload) => {
    const gesture = typeof payload === "string" ? payload : payload?.gesture;
    const timestampMs =
      typeof payload === "object" && payload && typeof payload.timestampMs === "number"
        ? payload.timestampMs
        : Math.round(performance.now());
    if (!gesture) return;

    const expected = targetBeat[currentBeatIndex];
    const correct = gesture === expected;

    setPlayedBeats((prev) => [...prev, { gesture, timestampMs, correct }]);
    if (correct) {
      setCurrentBeatIndex((i) => i + 1);
    }
  };

  const analyzeBeat = async () => {
    setLoading(true);
    setReport(null);
    setNarrative("");
    try {
      const response = await fetch("/api/tutorials/analyze-beat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetBeat,
          playedBeats,
          idealGapMs,
          source: "camera",
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setReport(data.report || null);
        setNarrative(data.feedback || "");
        setUsedAI(Boolean(data.usedAI));
      } else {
        setNarrative(data.error || "Failed to get feedback.");
      }
    } catch (error) {
      console.error("Error analyzing beat:", error);
      setNarrative("An error occurred while analyzing the beat.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPlayedBeats([]);
    setCurrentBeatIndex(0);
    setReport(null);
    setNarrative("");
    setUsedAI(false);
  };

  return (
    <div className="relative min-h-screen pt-6 pb-20 px-4">
      <div className="absolute top-24 left-0 w-72 h-72 opacity-20 pointer-events-none hidden lg:block rounded-full overflow-hidden z-0">
        <Image src={decorImagery.sceneA.src} alt="" fill className="object-cover blur-sm" sizes="288px" />
      </div>

      <div className="relative max-w-4xl mx-auto py-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gradient-neon sm:text-4xl">Gesture lab</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Camera stream inside a glass viewport — stroke order and timing vs target pattern.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 items-center glass-panel rounded-2xl py-4 px-4">
          <label className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
            Target gap (ms)
            <input
              type="number"
              min={200}
              max={2000}
              step={50}
              value={idealGapMs}
              onChange={(e) => setIdealGapMs(Number(e.target.value) || 600)}
              className="w-24 glass-panel rounded-lg px-2 py-1 border-red-400/20"
            />
          </label>
          <button
            type="button"
            onClick={reset}
            className="text-sm text-red-600 dark:text-red-300 hover:underline"
          >
            Reset session
          </button>
        </div>

        <div className="mt-10 rounded-3xl overflow-hidden glass-panel-strong border-red-400/20 p-2 shadow-[0_0_40px_rgba(220,38,38,0.12)]">
          <HandGestureRecognition onGestureDetected={handleGestureDetected} />
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">
          Gestures use a demo heuristic; each stroke includes a timestamp for interval analysis.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel-strong rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Target beat</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 break-words font-mono">
              {targetBeat.join(" → ")}
            </p>
          </div>

          <div className="glass-panel-strong rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your beat</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {playedBeats.map((beat, index) => (
                <span
                  key={index}
                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                    beat.correct
                      ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-400/30"
                      : "bg-rose-500/20 text-rose-900 dark:text-rose-100 border border-rose-400/30"
                  }`}
                  title={beat.timestampMs != null ? `t=${beat.timestampMs}` : ""}
                >
                  {beat.gesture}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border-amber-400/25 bg-amber-500/5">
            <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200">Next beat</h2>
            <p className="mt-2 text-3xl font-extrabold text-amber-900 dark:text-amber-100">
              {currentBeatIndex < targetBeat.length ? targetBeat[currentBeatIndex] : "—"}
            </p>
          </div>
        </div>

        <div className="mt-10 text-center space-y-3">
          <button
            type="button"
            onClick={analyzeBeat}
            disabled={loading || playedBeats.length === 0}
            className="btn-future-primary rounded-2xl disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing…" : "Get AI feedback"}
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set <code className="text-xs glass-panel px-1 rounded">OPENAI_API_KEY</code> for richer coaching text.
          </p>
        </div>

        {(report || narrative) && (
          <ParaiFeedbackPanel report={report} narrative={narrative} usedAI={usedAI} />
        )}
      </div>
    </div>
  );
}
