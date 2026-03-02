"use client";

import { useEffect, useRef, useState } from "react";

const BEAT_OPTIONS = [
  { value: "adikuchi", label: "Adikuchi" },
  { value: "sundukuchi", label: "Sundukuchi" },
  { value: "together", label: "Together" },
];

export default function UploadBeatPage() {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const [beatType, setBeatType] = useState("adikuchi");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [audioUrl]);

  async function startRecording() {
    setError("");
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);

        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // stop mic tracks
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      mr.start();
      setIsRecording(true);
    } catch (e) {
      setError("Microphone permission denied or unavailable.");
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }

  function onUploadFile(e) {
    setError("");
    setResult(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // Accept common audio types; you can be stricter if you want.
    if (!file.type.startsWith("audio/")) {
      setError("Please upload a valid audio file.");
      return;
    }

    setAudioBlob(file);

    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  }

  function clearAudio() {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
  }

  async function submitForRecommendations() {
    setError("");
    setResult(null);

    if (!audioBlob) {
      setError("Record or upload a beat first.");
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("beatType", beatType);
      form.append("notes", notes);
      form.append("audio", audioBlob, "beat.webm"); // name is fine even if uploaded mp3; server can handle

      // TODO: replace with your real route
      const res = await fetch("/api/recommendations/beat", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Submission failed");
      }

      setResult(data);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Play a Beat → Get Recommendations
          </h1>
          <p className="text-zinc-300 max-w-2xl">
            Record (or upload) a short beat. We’ll analyze it and recommend what to practice next.
          </p>
        </div>

        {/* Main grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recorder card */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Record or Upload</h2>
                <p className="text-sm text-zinc-300 mt-1">
                  Keep it short (0.5–3s). One clean hit or a short pattern is perfect.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border",
                    isRecording
                      ? "bg-red-500/10 border-red-400/30 text-red-200"
                      : "bg-emerald-500/10 border-emerald-400/20 text-emerald-200",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-2 w-2 rounded-full",
                      isRecording ? "bg-red-400 animate-pulse" : "bg-emerald-400",
                    ].join(" ")}
                  />
                  {isRecording ? "Recording" : "Ready"}
                </span>
              </div>
            </div>

            {/* Beat type */}
            <div className="mt-6">
              <label className="text-sm text-zinc-200">Beat Type</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {BEAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBeatType(opt.value)}
                    className={[
                      "rounded-xl border px-3 py-2 text-sm transition",
                      beatType === opt.value
                        ? "bg-white/15 border-white/20 text-white"
                        : "bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black px-4 py-3 font-semibold hover:bg-zinc-200 transition"
                >
                  <span className="text-lg">🎙️</span>
                  Start Recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 text-white px-4 py-3 font-semibold hover:bg-red-400 transition"
                >
                  <span className="text-lg">⏹️</span>
                  Stop
                </button>
              )}

              <label className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold cursor-pointer hover:bg-white/10 transition">
                <span className="text-lg">📁</span>
                Upload Audio
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={onUploadFile}
                />
              </label>

              <button
                type="button"
                onClick={clearAudio}
                disabled={!audioBlob}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-3 font-semibold text-zinc-200 disabled:opacity-40 hover:bg-white/5 transition"
              >
                <span className="text-lg">🧹</span>
                Clear
              </button>
            </div>

            {/* Playback */}
            <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold">Playback</div>
                  <div className="text-xs text-zinc-400">
                    {audioBlob ? "Ready to play your recording." : "No audio yet."}
                  </div>
                </div>
                {audioBlob && (
                  <div className="text-xs text-zinc-400">
                    {(audioBlob.size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>

              <div className="mt-3">
                {audioUrl ? (
                  <audio controls src={audioUrl} className="w-full" />
                ) : (
                  <div className="text-sm text-zinc-400">
                    Record or upload to enable playback.
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="text-sm text-zinc-200">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Example: I’m practicing faster transitions, or I keep missing the accent…"
                className="mt-2 w-full min-h-[110px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {/* Submit */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="text-sm text-zinc-400">
                Tip: one clean beat is better than noisy audio.
              </div>

              <button
                type="button"
                onClick={submitForRecommendations}
                disabled={submitting || !audioBlob}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 transition"
              >
                {submitting ? "Submitting..." : "Submit for Recommendations"}
                <span>→</span>
              </button>
            </div>

            {/* Errors */}
            {error && (
              <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-red-200">
                {error}
              </div>
            )}
          </div>

          {/* Right: Recommendation panel */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
            <h3 className="text-lg font-semibold">Recommendations</h3>
            <p className="mt-1 text-sm text-zinc-300">
              After you submit, we’ll suggest practice drills, tempo targets, and similar beats.
            </p>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
              {!result ? (
                <div className="text-sm text-zinc-400">
                  No results yet. Submit a beat to see suggestions here.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                    <div className="text-xs text-zinc-400">Detected</div>
                    <div className="text-base font-semibold">
                      {result.detected || "—"}
                    </div>
                  </div>

                  <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                    <div className="text-xs text-zinc-400">Next drills</div>
                    <ul className="mt-2 space-y-2 text-sm">
                      {(result.drills || []).map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                      {!result.drills?.length && (
                        <li className="text-zinc-400">—</li>
                      )}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                    <div className="text-xs text-zinc-400">Tempo target</div>
                    <div className="text-sm">
                      {result.tempoTarget || "—"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 text-xs text-zinc-500 leading-relaxed">
              Backend route used: <span className="text-zinc-300">/api/recommendations/beat</span>
              <br />
              Send FormData: <span className="text-zinc-300">audio + beatType + notes</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} Beat Studio — Upload, analyze, and improve.
        </div>
      </div>
    </div>
  );
}
