"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Play, CheckCircle2, XCircle, MessageCircle, RotateCcw } from "lucide-react";
import HandGestureRecognition from "@/components/HandGestureRecognition";
import {
  isTamilBeatSequence,
  parseTamilBeatSequence,
  normalizeTamilPracticeStroke,
} from "@/lib/tamilBeatNotation";
import { playBeatSound } from "@/lib/playTamilBeat";
import { beatNameToStrokeKey, STROKE_LABELS, normalizeGestureKey } from "@/lib/paraiStroke";

/**
 * Nilai + beat picker and camera practice (shared by /tutorials and /dashboard).
 * @param {{ className?: string, headingClassName?: string }} props
 */
export default function TutorialsHubContent({ className = "", headingClassName = "" }) {
  const { status } = useSession();
  const [nilais, setNilais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNilaiId, setSelectedNilaiId] = useState(null);
  const [selectedBeatId, setSelectedBeatId] = useState(null);
  const [lastGesture, setLastGesture] = useState("");
  const [matchOk, setMatchOk] = useState(null);
  const [sequenceStep, setSequenceStep] = useState(0);
  const [sequenceDone, setSequenceDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/tutorials/nilai", { cache: "no-store" });
        const data = await res.json();
        const list = (data.nilais || [])
          .sort((a, b) => a.order - b.order)
          .slice(0, 4);
        if (mounted) setNilais(list);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedNilai = useMemo(
    () => nilais.find((n) => n.id === selectedNilaiId) || null,
    [nilais, selectedNilaiId]
  );

  const selectedBeat = useMemo(
    () => selectedNilai?.beats?.find((b) => b.id === selectedBeatId) || null,
    [selectedNilai, selectedBeatId]
  );

  const tamilParsed = useMemo(() => {
    if (!selectedBeat?.name || !isTamilBeatSequence(selectedBeat.name)) return null;
    return parseTamilBeatSequence(selectedBeat.name);
  }, [selectedBeat]);

  const legacyExpectedKey = selectedBeat && !tamilParsed ? beatNameToStrokeKey(selectedBeat.name) : null;

  useEffect(() => {
    setSelectedBeatId(null);
    resetPracticeState();
  }, [selectedNilaiId]);

  useEffect(() => {
    resetPracticeState();
  }, [selectedBeatId]);

  function resetPracticeState() {
    setMatchOk(null);
    setLastGesture("");
    setSequenceStep(0);
    setSequenceDone(false);
  }

  const onGestureDetected = useCallback(
    ({ gesture }) => {
      const g = tamilParsed
        ? normalizeTamilPracticeStroke(gesture)
        : normalizeGestureKey(gesture);
      setLastGesture(g);

      if (tamilParsed) {
        const { flatStrokes } = tamilParsed;
        if (!flatStrokes.length) {
          setMatchOk(null);
          return;
        }
        if (sequenceDone) return;

        const expected = flatStrokes[sequenceStep];
        const ok = g === expected;
        setMatchOk(ok);
        if (ok) {
          const next = sequenceStep + 1;
          if (next >= flatStrokes.length) {
            setSequenceDone(true);
          } else {
            setSequenceStep(next);
          }
        }
        return;
      }

      if (!legacyExpectedKey) {
        setMatchOk(null);
        return;
      }
      setMatchOk(g === legacyExpectedKey);
    },
    [tamilParsed, legacyExpectedKey, sequenceStep, sequenceDone]
  );

  const playRefAudio = () => {
    if (!selectedBeat) return;
    playBeatSound(selectedBeat);
  };

  return (
    <div className={`pb-16 px-4 ${className}`}>
      <div className="max-w-5xl mx-auto pt-6 md:pt-10 space-y-10">
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${headingClassName}`}>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-neon">Tutorials</h1>
          {status === "authenticated" ? (
            <Link
              href="/tutorials/parai-chatbot"
              className="inline-flex items-center justify-center gap-2 btn-future-primary rounded-xl text-sm !py-3 !px-5 w-fit"
            >
              <MessageCircle size={18} />
              Parai chatbot
            </Link>
          ) : (
            <Link
              href="/login?callbackUrl=%2Ftutorials%2Fparai-chatbot"
              className="inline-flex items-center justify-center gap-2 btn-future-ghost rounded-xl text-sm !py-3 !px-5 w-fit border border-red-500/30"
            >
              <MessageCircle size={18} />
              Sign in for chatbot
            </Link>
          )}
        </div>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Nilai</h2>
          {loading ? (
            <p className="text-slate-500 text-sm">Loading…</p>
          ) : nilais.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 glass-panel rounded-2xl p-6 text-sm">
              No nilais found. Run <code className="text-red-600/90">npx prisma db push</code> then{" "}
              <code className="text-red-600/90">npm run db:seed</code>.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {nilais.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedNilaiId(n.id)}
                  className={`text-left rounded-2xl p-4 border transition glass-panel-strong ${
                    selectedNilaiId === n.id
                      ? "border-red-500/60"
                      : "border-red-400/15 hover:border-red-400/40"
                  }`}
                >
                  <p className="text-xs text-red-600 dark:text-red-400">Nilai {n.order}</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">{n.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{n.beats?.length || 0} beats</p>
                </button>
              ))}
            </div>
          )}
          {selectedNilai && (
            <p className="mt-4">
              <Link
                href={`/tutorials/nilai/${selectedNilai.id}`}
                className="text-sm text-red-600 dark:text-red-400 font-semibold hover:underline"
              >
                Full lesson: timer, rhythm recording &amp; AI feedback →
              </Link>
            </p>
          )}
        </section>

        {selectedNilai && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Beat</h2>
            <div className="flex flex-wrap gap-2">
              {selectedNilai.beats?.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBeatId(b.id)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium border transition max-w-full ${
                    selectedBeatId === b.id
                      ? "bg-red-600 text-white border-red-500"
                      : "glass-panel border-red-400/20 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <span className="block font-tamil text-base leading-snug break-all">{b.name}</span>
                  {b.type && (
                    <span className="block text-[0.65rem] opacity-80 mt-1 font-sans">{b.type}</span>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {selectedBeat && (
          <section className="grid lg:grid-cols-2 gap-6 items-start">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Practice</h2>
              <div className="rounded-2xl overflow-hidden glass-panel-strong border-red-400/20 p-2">
                <HandGestureRecognition onGestureDetected={onGestureDetected} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl glass-panel-strong border-red-400/20 p-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">Target</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white font-tamil leading-relaxed">
                  {selectedBeat.name}
                </p>
                {selectedBeat.type && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{selectedBeat.type}</p>
                )}
                {tamilParsed && tamilParsed.flatStrokes.length > 0 && (
                  <p className="text-xs text-slate-500 mt-3">
                    Play left = த (tha), right = கு / தி (ku — same note). Spaces in the phrase = longer pause;
                    tight clusters = shorter gaps. Step{" "}
                    {Math.min(sequenceStep + 1, tamilParsed.flatStrokes.length)} / {tamilParsed.flatStrokes.length}
                    {sequenceDone && " — complete"}
                  </p>
                )}
                {!tamilParsed && legacyExpectedKey && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {STROKE_LABELS[legacyExpectedKey] || legacyExpectedKey}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    type="button"
                    onClick={playRefAudio}
                    className="btn-future-primary rounded-xl flex items-center gap-2 text-sm !py-2.5"
                  >
                    <Play size={16} /> Play sequence
                  </button>
                  <button
                    type="button"
                    onClick={resetPracticeState}
                    className="btn-future-ghost rounded-xl flex items-center gap-2 text-sm !py-2.5"
                  >
                    <RotateCcw size={16} /> Reset steps
                  </button>
                </div>
              </div>
              <div className="rounded-2xl glass-panel border-red-400/20 p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">Detected</p>
                <p className="text-xl font-bold capitalize text-slate-900 dark:text-white">
                  {lastGesture || "—"}
                </p>
                {tamilParsed && !sequenceDone && matchOk !== null && (
                  <div
                    className={`mt-3 flex items-center gap-2 text-sm font-semibold ${
                      matchOk ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {matchOk ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {matchOk ? "Correct — next stroke" : "Expected " + (tamilParsed.flatStrokes[sequenceStep] || "?")}
                  </div>
                )}
                {tamilParsed && sequenceDone && (
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={18} /> Sequence complete
                  </div>
                )}
                {!tamilParsed && legacyExpectedKey && matchOk !== null && (
                  <div
                    className={`mt-3 flex items-center gap-2 text-sm font-semibold ${
                      matchOk ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {matchOk ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {matchOk ? "Match" : "No match"}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
