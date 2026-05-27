"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

/**
 * Visual and audio metronome for Parai practice.
 * @param {{ bpm: number, onBpmChange: (bpm: number) => void, beatSubdivision?: number, onBeat?: (beat: number) => void, className?: string }} props
 */
export default function Metronome({
  bpm: externalBpm = 120,
  onBpmChange,
  beatSubdivision = 4,
  onBeat,
  className = "",
}) {
  const [bpm, setBpm] = useState(externalBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(false);

  const audioContextRef = useRef(null);
  const nextBeatTimeRef = useRef(0);
  const timerIdRef = useRef(null);
  const currentBeatRef = useRef(0);

  useEffect(() => {
    setBpm(externalBpm);
  }, [externalBpm]);

  const scheduleNote = useCallback((beatNumber, time) => {
    if (!audioContextRef.current || muted) return;

    try {
      const osc = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      const isDownbeat = beatNumber % beatSubdivision === 0;
      osc.frequency.value = isDownbeat ? 1200 : 800;
      osc.type = 'sine';

      gainNode.gain.setValueAtTime(volume * (isDownbeat ? 0.8 : 0.4), time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

      osc.start(time);
      osc.stop(time + 0.1);

      // Update UI on the main thread
      const now = audioContextRef.current.currentTime;
      const delay = (time - now) * 1000;
      setTimeout(() => {
        setCurrentBeat(beatNumber);
        onBeat?.(beatNumber);
      }, Math.max(0, delay));
    } catch (error) {
      console.warn('[Metronome] Schedule error:', error);
    }
  }, [beatSubdivision, volume, muted, onBeat]);

  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;

    const currentTime = audioContextRef.current.currentTime;
    const scheduleAheadTime = 0.1; // Schedule 100ms ahead

    while (nextBeatTimeRef.current < currentTime + scheduleAheadTime) {
      scheduleNote(currentBeatRef.current, nextBeatTimeRef.current);
      
      const secondsPerBeat = 60.0 / bpm;
      nextBeatTimeRef.current += secondsPerBeat;
      currentBeatRef.current++;
    }

    timerIdRef.current = setTimeout(scheduler, 25);
  }, [bpm, scheduleNote]);

  const start = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    currentBeatRef.current = 0;
    nextBeatTimeRef.current = audioContextRef.current.currentTime;
    setIsPlaying(true);
    scheduler();
  }, [scheduler]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    setCurrentBeat(0);
    currentBeatRef.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleBpmChange = (newBpm) => {
    const validated = Math.max(30, Math.min(240, newBpm));
    setBpm(validated);
    onBpmChange?.(validated);
  };

  const beatDots = Array.from({ length: beatSubdivision }, (_, i) => i);

  return (
    <div className={`glass-panel p-6 rounded-2xl border-red-400/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={isPlaying ? stop : start}
            className="w-12 h-12 rounded-xl bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center text-white shadow-lg shadow-red-600/20"
            aria-label={isPlaying ? 'Stop metronome' : 'Start metronome'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>

          <div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">
              Metronome
            </div>
            <div className="text-2xl font-black text-white">{bpm} <span className="text-sm text-slate-500">BPM</span></div>
          </div>
        </div>

        <button
          onClick={() => setMuted(!muted)}
          className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Beat indicator dots */}
      <div className="flex gap-2 mb-4">
        {beatDots.map((i) => {
          const isActive = isPlaying && (currentBeat % beatSubdivision) === i;
          const isDownbeat = i === 0;
          return (
            <div
              key={i}
              className={`flex-1 h-3 rounded-full transition-all duration-100 ${
                isActive
                  ? isDownbeat
                    ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110'
                    : 'bg-cyan-400 shadow-lg shadow-cyan-400/50 scale-110'
                  : isDownbeat
                  ? 'bg-red-500/20'
                  : 'bg-slate-700'
              }`}
            />
          );
        })}
      </div>

      {/* BPM Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min="30"
          max="240"
          step="5"
          value={bpm}
          onChange={(e) => handleBpmChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgb(220, 38, 38) 0%, rgb(220, 38, 38) ${((bpm - 30) / (240 - 30)) * 100}%, rgb(51, 65, 85) ${((bpm - 30) / (240 - 30)) * 100}%, rgb(51, 65, 85) 100%)`
          }}
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>30</span>
          <span>60</span>
          <span>90</span>
          <span>120</span>
          <span>150</span>
          <span>180</span>
          <span>210</span>
          <span>240</span>
        </div>
      </div>

      {/* Preset BPMs */}
      <div className="flex gap-2 mt-4">
        {[60, 80, 100, 120, 140].map((preset) => (
          <button
            key={preset}
            onClick={() => handleBpmChange(preset)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
              bpm === preset
                ? 'bg-red-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {!muted && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
            Volume
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
