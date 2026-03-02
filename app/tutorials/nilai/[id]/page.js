"use client";

<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Play, ChevronLeft, ChevronRight, Timer } from "lucide-react";
import { useToast } from "@/hooks/useToast";
=======
import { useState } from "react";
import { Play } from "lucide-react";
import {UploadBeatPage} from "../components/upload.js"
>>>>>>> dd06bc994bf246939fc9a8cc4761a3a6150c1362

export default function NilaiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { addToast } = useToast();

  const [nilai, setNilai] = useState(null);
  const [allNilais, setAllNilais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [practiceSeconds, setPracticeSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

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
    const url = beat.audioUrl || `/audio/${beat.name.toLowerCase()}.mp3`;
    const audio = new Audio(url);
    audio.play().catch(() => {
      console.warn("Audio not available:", url);
    });
  }, []);

  useEffect(() => {
    if (!timerActive) return;
    const iv = setInterval(() => setPracticeSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [timerActive]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const beats = nilai?.beats || [];
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= beats.length) {
        e.preventDefault();
        playAudio(beats[num - 1]);
      }
      if (e.key === "Escape") setSelectedBeat(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nilai?.beats, playAudio]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-red-100">
        <div className="text-xl text-gray-600">Loading…</div>
      </div>
    );
  }

  if (!nilai) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-red-100 gap-4">
        <p className="text-xl text-gray-600">Nilai not found.</p>
        <Link href="/dashboard" className="text-red-700 underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const beats = nilai.beats || [];
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-yellow-50 to-red-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="absolute top-24 right-6 flex items-center gap-2 bg-white/80 dark:bg-gray-800 rounded-lg px-4 py-2 shadow">
        <Timer size={20} />
        <span className="font-mono">{fmt(practiceSeconds)}</span>
        <button
          onClick={() => setTimerActive((a) => !a)}
          className="text-sm text-red-600 hover:underline"
        >
          {timerActive ? "Pause" : "Start"}
        </button>
      </div>

      <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-red-700">{nilai.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {nilai.tutorial?.title || "Learn Parai"} – {beats.length} beat{beats.length !== 1 ? "s" : ""}
        </p>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Press 1–{beats.length} to play beats, Esc to close modal
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 max-w-5xl mx-auto">
        {beats.map((beat, i) => (
          <div
            key={beat.id}
            className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg p-6 text-center cursor-pointer hover:scale-105 transition"
            onClick={() => setSelectedBeat(beat)}
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{beat.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{beat.type}</p>
            <span className="text-xs text-gray-400">[{i + 1}]</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playAudio(beat);
              }}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 mx-auto"
            >
              <Play size={18} /> Play
            </button>
          </div>
        ))}
      </div>

      {selectedBeat && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-96 text-center shadow-xl">
            <h2 className="text-3xl font-bold text-red-700 dark:text-red-400">{selectedBeat.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{selectedBeat.type}</p>

            <div
              className="w-40 h-40 mx-auto my-6 rounded-full flex items-center justify-center text-6xl bg-amber-100 border-4 border-amber-800"
              style={{
                backgroundImage: "url('/parai-drum.svg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              🥁
            </div>

            <button
              onClick={() => playAudio(selectedBeat)}
              className="bg-red-600 text-white px-6 py-2 rounded-full flex items-center gap-2 mx-auto"
            >
              <Play size={18} /> Play Again
            </button>

            <UploadBeatPage></UploadBeatPage>

            <button
              onClick={() => {
                markBeatComplete(selectedBeat.id);
                setSelectedBeat(null);
              }}
              className="mt-3 bg-green-600 text-white px-6 py-2 rounded-full"
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
        <div className="mt-16 px-6 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {nilai.name} Sequence
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {beats.map((b) => b.name).join(" → ")}
          </p>
          <button
            onClick={() => {
              setTimerActive(true);
              beats.forEach((b, i) =>
                setTimeout(() => playAudio(b), i * 1000)
              );
            }}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full"
          >
            Play Full Sequence
          </button>
        </div>
      )}

      <div className="flex justify-between px-10 mt-20 pb-10">
        {prevNilai ? (
          <Link
            href={`/tutorials/nilai/${prevNilai.id}`}
            className="bg-gray-300 px-6 py-2 rounded-full flex items-center gap-2"
          >
            <ChevronLeft size={20} /> Previous Nilai
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="bg-gray-300 px-6 py-2 rounded-full flex items-center gap-2"
          >
            <ChevronLeft size={20} /> Dashboard
          </Link>
        )}

        {nextNilai ? (
          <Link
            href={`/tutorials/nilai/${nextNilai.id}`}
            className="bg-gray-800 text-white px-6 py-2 rounded-full flex items-center gap-2"
          >
            Next Nilai <ChevronRight size={20} />
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="bg-gray-800 text-white px-6 py-2 rounded-full flex items-center gap-2"
          >
            Done <ChevronRight size={20} />
          </Link>
        )}
      </div>
    </div>
  );
}
