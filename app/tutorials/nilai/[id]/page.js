"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Play, ChevronLeft, ChevronRight, Timer, Camera, Keyboard, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import ParaiFeedbackPanel from "@/components/ParaiFeedbackPanel";
import HandGestureRecognition from "@/components/HandGestureRecognition";
import { useLanguage } from "@/lib/LanguageContext";
import { playBeatSound } from "@/lib/playTamilBeat";
import { isTamilBeatSequence, parseTamilBeatSequence } from "@/lib/tamilBeatNotation";
import { canonicalStrokeKey, parseNotation } from "@/utils/beatFeedback";

export default function NilaiPage() {
  const params = useParams();
  const id = params?.id;
  const { addToast } = useToast();

  const [nilai, setNilai] = useState(null);
  const [allNilais, setAllNilais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [practiceSeconds, setPracticeSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [rhythmRecording, setRhythmRecording] = useState(false);
  const [rhythmTaps, setRhythmTaps] = useState([]);
  const [idealGapMs, setIdealGapMs] = useState(600);
  const [rhythmReport, setRhythmReport] = useState(null);
  const [rhythmNarrative, setRhythmNarrative] = useState("");
  const [rhythmUsedAI, setRhythmUsedAI] = useState(false);
  const [rhythmLoading, setRhythmLoading] = useState(false);
  
  // Vision Mode States
  const [useVision, setUseVision] = useState(false);
  const lastVisionHitRef = useRef(0);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    (async () => {
      try {
        const [nilaiRes, nilaisRes] = await Promise.all([
          fetch(`/api/nilai/${id}`, { cache: "no-store" }),
          fetch("/api/tutorials/nilai", { cache: "no-store" }),
        ]);

        if (!mounted) return;

        if (nilaiRes.ok) {
          const data = await nilaiRes.json();
          setNilai(data);
        }

        if (nilaisRes.ok) {
          const { nilais: list } = await nilaisRes.json();
          setAllNilais(list || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false };
  }, [id]);

  const playAudio = useCallback((beat) => {
    playBeatSound(beat);
  }, []);

  useEffect(() => {
    if (!timerActive) return;
    const iv = setInterval(() => setPracticeSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [timerActive]);

  const handleManualTap = useCallback(() => {
    setRhythmTaps((prev) => {
      if (prev.length >= expectedStrokes) return prev;
      const idx = prev.length;
      const tn = (targetNotation || "").trim();
      let gesture = "ku";
      if (isTamilBeatSequence(tn)) {
        const { flatStrokes } = parseTamilBeatSequence(tn);
        gesture = flatStrokes[idx] || "ku";
      } else {
        const pat = parseNotation(tn);
        gesture = pat[idx]?.name || "ku";
      }
      return [...prev, { gesture, timestampMs: Math.round(performance.now()) }];
    });
  }, [expectedStrokes, targetNotation]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const beats = nilai?.beats || [];
      if (rhythmRecording && !useVision && e.code === "Space") {
        e.preventDefault();
        handleManualTap();
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= beats.length) {
        e.preventDefault();
        playAudio(beats[num - 1]);
      }
      if (e.key === "Escape") setSelectedBeat(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nilai?.beats, playAudio, rhythmRecording, useVision, handleManualTap, expectedStrokes]);

  const onVisionGesture = useCallback((data) => {
    if (!rhythmRecording) return;
    setRhythmTaps((prev) => {
      if (prev.length >= expectedStrokes) return prev;
      return [
        ...prev,
        {
          gesture: data.gesture,
          timestampMs: data.timestampMs,
        },
      ];
    });
  }, [rhythmRecording, expectedStrokes]);

  const [targetNotation, setTargetNotation] = useState("");
  const [baseUnitMs, setBaseUnitMs] = useState(300);

  useEffect(() => {
    if (nilai?.beats?.length) {
      setTargetNotation(nilai.beats.map((b) => b.name).join(" "));
    }
  }, [nilai]);

  const expectedStrokes = useMemo(() => {
    const tn = (targetNotation || "").trim();
    const combinedFromNilai = nilai?.beats?.map((b) => b.name).join(" ").trim() || "";
    const source = tn || combinedFromNilai;
    const fallback = nilai?.beats?.length || 0;
    if (!source) return fallback;
    if (isTamilBeatSequence(source)) {
      const { flatStrokes } = parseTamilBeatSequence(source);
      return Math.max(flatStrokes.length, 1);
    }
    const pat = parseNotation(source);
    return Math.max(pat.length, fallback);
  }, [targetNotation, nilai?.beats]);

  /** Flat canonical stroke list for the active target (passed to analyze-beat / OpenAI). */
  const expectedStrokesList = useMemo(() => {
    const tn =
      (targetNotation || "").trim() ||
      nilai?.beats?.map((b) => b.name).join(" ").trim() ||
      "";
    if (!tn) return [];
    if (isTamilBeatSequence(tn)) {
      return parseTamilBeatSequence(tn).flatStrokes;
    }
    return parseNotation(tn).map((b) => b.name);
  }, [targetNotation, nilai?.beats]);

  const interBeatGapsLive = useMemo(() => {
    if (rhythmTaps.length < 2) return [];
    const g = [];
    for (let i = 1; i < rhythmTaps.length; i++) {
      const a = rhythmTaps[i - 1]?.timestampMs;
      const b = rhythmTaps[i]?.timestampMs;
      if (typeof a === "number" && typeof b === "number") g.push(Math.round(b - a));
    }
    return g;
  }, [rhythmTaps]);

  const fetchRhythmFeedback = async () => {
    const beats = nilai?.beats || [];
    if (!beats.length || rhythmTaps.length === 0) return;
    const notationForApi =
      (targetNotation || "").trim() || beats.map((b) => b.name).join(" ");
    setRhythmLoading(true);
    setRhythmReport(null);
    setRhythmNarrative("");
    try {
      const res = await fetch("/api/tutorials/analyze-beat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetNotation: notationForApi,
          targetBeatLabel: beats.map((b) => b.name).join(" | ") || nilai?.name || "",
          expectedStrokesInOrder: expectedStrokesList,
          detectedStrokesInOrder: rhythmTaps.map((t) => canonicalStrokeKey(t.gesture)),
          playedBeats: rhythmTaps,
          baseUnitMs,
          source: useVision ? "camera" : "tap_rhythm",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRhythmReport(data.report);
        setRhythmNarrative(data.feedback || "");
        setRhythmUsedAI(Boolean(data.usedAI));
      } else {
        setRhythmNarrative(data.error || "Could not analyze.");
      }
    } catch (err) {
      console.error(err);
      setRhythmNarrative("Request failed.");
    } finally {
      setRhythmLoading(false);
    }
  };

  const markBeatComplete = async (beatId) => {
    try {
      await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beatId, status: "completed" }),
      });
      addToast("Beat marked complete!", "success");
    } catch (e) {
      console.error(e);
      addToast("Failed to save progress", "error");
    }
  };

  const currentIndex = allNilais.findIndex((n) => n.id === id);
  const prevNilai = currentIndex > 0 ? allNilais[currentIndex - 1] : null;
  const nextNilai = currentIndex >= 0 && currentIndex < allNilais.length - 1 ? allNilais[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass-panel-strong rounded-2xl px-10 py-8 text-lg">Loading…</div>
      </div>
    );
  }

  if (!nilai) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-xl text-slate-600 dark:text-slate-300">Nilai not found.</p>
        <Link href="/dashboard" className="btn-future-primary rounded-xl">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const beats = nilai.beats || [];
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="relative min-h-screen pt-6 pb-16 px-4">
      <div className="absolute top-20 right-4 sm:right-8 flex items-center gap-2 glass-panel-strong rounded-xl px-4 py-2 z-10">
        <Timer size={20} />
        <span className="font-mono text-slate-800 dark:text-slate-100">{fmt(practiceSeconds)}</span>
        <button
          onClick={() => setTimerActive((a) => !a)}
          className="text-sm text-red-600 dark:text-red-300 hover:underline"
        >
          {timerActive ? "Pause" : "Start"}
        </button>
      </div>

      <div className="text-center py-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient-neon">{nilai.name}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          {nilai.tutorial?.title || "Learn Parai"} – {beats.length} beat{beats.length !== 1 ? "s" : ""}
        </p>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-2xl mx-auto text-center">
        Press 1–{beats.length} to play reference audio, Esc to close modal
        {rhythmRecording && !useVision && (
          <span className="block mt-1 text-amber-700 dark:text-amber-300 font-medium animate-pulse">
            Manual mode: press Space once per stroke ({rhythmTaps.length}/{expectedStrokes})
          </span>
        )}
        {rhythmRecording && useVision && (
          <span className="block mt-1 text-red-600 dark:text-red-400 font-medium animate-pulse">
            Vision mode: index tips toward drum — one stroke per hit ({rhythmTaps.length}/{expectedStrokes})
          </span>
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {beats.map((beat, i) => (
          <div
            key={beat.id}
            className="glass-panel-strong rounded-2xl p-6 text-center cursor-pointer hover:scale-[1.02] transition border-red-400/10 hover:border-red-400/35 hover:shadow-[0_0_32px_rgba(220,38,38,0.12)]"
            onClick={() => setSelectedBeat(beat)}
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{beat.name}</h2>
            <p className="text-slate-500 dark:text-slate-400">{beat.type}</p>
            <span className="text-xs text-slate-400">[{i + 1}]</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playAudio(beat);
              }}
              className="mt-3 btn-future-primary rounded-xl text-sm !py-2 flex items-center gap-2 mx-auto"
            >
              <Play size={18} /> Play
            </button>
          </div>
        ))}
      </div>

      {selectedBeat && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel-strong rounded-3xl p-8 w-full max-w-md text-center border-red-400/25">
            <h2 className="text-3xl font-bold text-gradient-neon">{selectedBeat.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{selectedBeat.type}</p>

            <div
              className="w-40 h-40 mx-auto my-6 rounded-full bg-red-50 dark:bg-red-950/40 border-4 border-red-800 dark:border-red-600"
              style={{
                backgroundImage: "url('/parai-drum.svg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              aria-hidden
            />

            <button
              onClick={() => playAudio(selectedBeat)}
              className="btn-future-primary rounded-xl flex items-center gap-2 mx-auto"
            >
              <Play size={18} /> Play Again
            </button>

            <button
              onClick={() => {
                markBeatComplete(selectedBeat.id);
                setSelectedBeat(null);
              }}
              className="mt-3 w-full rounded-xl py-2.5 font-semibold bg-emerald-600/90 text-white hover:bg-emerald-500 transition"
            >
              Mark Complete
            </button>

            <button
              onClick={() => setSelectedBeat(null)}
              className="mt-4 block text-gray-600 underline mx-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {beats.length > 0 && (
        <div className="mt-16 max-w-4xl mx-auto text-center glass-panel rounded-2xl py-8 px-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {nilai.name} Sequence
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {beats.map((b) => b.name).join(" → ")}
          </p>
          <button
            onClick={() => {
              setTimerActive(true);
              beats.forEach((b, i) =>
                setTimeout(() => playAudio(b), i * 1000)
              );
            }}
            className="mt-4 btn-future-ghost rounded-xl !bg-emerald-600/20 !border-emerald-400/40 text-emerald-800 dark:text-emerald-200"
          >
            Play Full Sequence
          </button>
        </div>
      )}

      {beats.length > 0 && (
      <div className="mt-12 max-w-4xl mx-auto rounded-[2.5rem] glass-panel-parai p-10 border-red-500/20 relative overflow-hidden">
        <div className="scanline-parai opacity-20" />
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white text-center uppercase tracking-tighter mb-4">
            {t("nilai.practice_title")}
          </h2>
          
          <div className="flex flex-col items-center gap-10">
            {/* Notation Editor */}
            <div className="w-full glass-panel-strong p-6 rounded-3xl border-white/5">
              <label className="block text-xs font-black uppercase tracking-widest text-red-500 mb-3">
                {t("nilai.notation_label")}
              </label>
              <input 
                type="text" 
                value={targetNotation} 
                onChange={(e) => setTargetNotation(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xl font-mono text-amber-400 focus:outline-none focus:border-red-500/50 transition-all uppercase"
                placeholder="theem-ku tha-ku-ku"
              />
              <p className="mt-3 text-[10px] text-slate-500 font-mono uppercase tracking-tight">
                - {language === "ta" ? "வேகமான இடைவெளி" : "DASH = FAST GAP"} | {language === "ta" ? "சாதாரண இடைவெளி" : "SPACE = STEADY GAP"}
              </p>
            </div>

            {/* Mode Selector */}
            <div className="flex p-1.5 bg-black/40 rounded-[2rem] border border-white/10 shadow-inner">
              <button
                onClick={() => setUseVision(false)}
                className={`flex items-center gap-2 px-8 py-3 rounded-[1.6rem] transition-all duration-500 ${
                  !useVision
                    ? "btn-future-primary shadow-red-600/10"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                <Keyboard size={20} />
                <span className="font-black text-xs uppercase tracking-widest">{t("nilai.manual_mode")}</span>
              </button>
              <button
                onClick={() => setUseVision(true)}
                className={`flex items-center gap-2 px-8 py-3 rounded-[1.6rem] transition-all duration-500 ${
                  useVision
                    ? "btn-future-primary shadow-red-600/10"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                <Camera size={20} />
                <span className="font-black text-xs uppercase tracking-widest">{t("nilai.vision_mode")}</span>
              </button>
            </div>

            {/* Main Action Group */}
            <div className="flex flex-wrap justify-center gap-4 w-full">
              <button
                onClick={() => {
                  setRhythmTaps([]);
                  setRhythmRecording((r) => !r);
                  setRhythmReport(null);
                  setRhythmNarrative("");
                }}
                className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-tighter transition-all duration-300 ${
                  rhythmRecording
                    ? "bg-red-600 text-white animate-pulse ring-4 ring-red-600/20"
                    : "btn-future-primary"
                }`}
              >
                {rhythmRecording ? (
                  <>{t("nilai.stop_recording")}</>
                ) : (
                  <>{t("nilai.start_recording")}</>
                )}
              </button>

              <button
                disabled={rhythmLoading || rhythmTaps.length === 0}
                onClick={fetchRhythmFeedback}
                className="px-10 py-5 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-tighter transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 flex items-center gap-2 shadow-xl shadow-indigo-600/20"
              >
                {rhythmLoading ? "..." : <><CheckCircle2 size={22} /> {t("nilai.analyze")}</>}
              </button>
            </div>

            {/* Display Area */}
            <div className="w-full max-w-3xl min-h-[440px] flex items-center justify-center relative overflow-hidden rounded-[2.5rem] group border border-white/5 bg-black/20">
              {useVision ? (
                <div className="w-full h-full relative">
                  <HandGestureRecognition 
                    running={rhythmRecording} 
                    onGestureDetected={onVisionGesture}
                  />
                </div>
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center p-12 text-center relative">
                  <div className="scanline-parai opacity-10" />
                  <Keyboard size={80} className="text-red-600/30 mb-8" />
                  <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">
                    {t("nilai.keyboard_title")}
                  </h3>
                  <p className="text-slate-400 max-w-sm text-lg font-medium">
                    {t("nilai.keyboard_desc")}
                  </p>
                  {rhythmRecording && (
                    <div className="mt-12 bg-red-600 text-white px-8 py-4 rounded-full font-black animate-bounce tracking-widest uppercase text-xl shadow-2xl shadow-red-600/40">
                       {t("nilai.hit_now")}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sequence List */}
            {rhythmTaps.length > 0 && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
                    {t("nilai.live_sequence")}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-4 p-8 glass-panel-strong rounded-[2rem] border-red-500/10 min-h-[100px] items-center">
                  {rhythmTaps.map((tap, i) => (
                    <div key={i} className="flex flex-col items-center group/item">
                      <div className="px-5 py-2.5 bg-gradient-to-b from-red-600 to-red-800 text-white rounded-xl text-sm font-black shadow-xl uppercase tracking-widest transform transition-transform group-hover/item:scale-110">
                        {tap.gesture}
                      </div>
                      <span className="text-[10px] font-mono text-amber-500 mt-2 opacity-80">
                        {i === 0 ? "START" : `+${Math.round(tap.timestampMs - rhythmTaps[0].timestampMs)}MS`}
                      </span>
                    </div>
                  ))}
                </div>
                {interBeatGapsLive.length > 0 && (
                  <p className="mt-4 text-xs font-mono text-slate-400 text-center">
                    Gaps between strokes (ms): {interBeatGapsLive.join(", ")}
                  </p>
                )}
              </div>
            )}

            {(rhythmReport || rhythmNarrative) && (
              <div className="w-full max-w-4xl">
                <ParaiFeedbackPanel
                  report={rhythmReport}
                  narrative={rhythmNarrative}
                  usedAI={rhythmUsedAI}
                />
              </div>
            )}
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
      )}

      <div className="flex flex-wrap justify-between gap-4 max-w-5xl mx-auto mt-20 pb-10 px-2">
        {prevNilai ? (
          <Link
            href={`/tutorials/nilai/${prevNilai.id}`}
            className="btn-future-ghost rounded-xl flex items-center gap-2"
          >
            <ChevronLeft size={20} /> Previous Nilai
          </Link>
        ) : (
          <Link href="/dashboard" className="btn-future-ghost rounded-xl flex items-center gap-2">
            <ChevronLeft size={20} /> Dashboard
          </Link>
        )}

        {nextNilai ? (
          <Link
            href={`/tutorials/nilai/${nextNilai.id}`}
            className="btn-future-primary rounded-xl flex items-center gap-2"
          >
            Next Nilai <ChevronRight size={20} />
          </Link>
        ) : (
          <Link href="/dashboard" className="btn-future-primary rounded-xl flex items-center gap-2">
            Done <ChevronRight size={20} />
          </Link>
        )}
      </div>
    </div>
  );
}
