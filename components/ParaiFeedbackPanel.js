"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Sparkles, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

export default function ParaiFeedbackPanel({ report, narrative, usedAI }) {
  const { language } = useLanguage();
  if (!report && !narrative) return null;

  const comparison = report?.comparison;
  const timing = report?.timing;
  const issues = report?.issues;
  const suggestions = report?.suggestions;
  const targetNotation = report?.targetNotation;
  const played = report?.played;

  return (
    <div className="mt-8 space-y-6 text-left rounded-[2.5rem] glass-panel-parai p-10 border-red-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Sparkles size={120} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center text-red-500">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
            {language === "ta" ? "AI மதிப்பீடு" : "AI Feedback"}
          </h3>
        </div>
        
        <div className="flex gap-2">
          {usedAI ? (
            <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white px-3 py-1 rounded-lg">
              {language === "ta" ? "மேம்படுத்தப்பட்டது" : "Enriched"}
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 px-3 py-1 rounded-lg">
              {language === "ta" ? "அடிப்படை" : "Standard"}
            </span>
          )}
        </div>
      </div>

      {narrative && (
        <div className="relative z-10 bg-black/40 border border-white/5 p-6 rounded-2xl">
          <p className="text-lg text-slate-200 leading-relaxed font-medium">
            {narrative}
          </p>
        </div>
      )}

      {comparison && (
        <div className="grid sm:grid-cols-2 gap-6 relative z-10">
          <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 size={18} />
              <span className="text-xs font-black uppercase tracking-widest">
                {language === "ta" ? "வாசிப்பு துல்லியம்" : "Stroke Accuracy"}
              </span>
            </div>
            <div>
              <p className="text-4xl font-black text-white leading-none">
                {comparison.matched} <span className="text-lg text-slate-500">/ {comparison.targetLength}</span>
              </p>
              <p className="mt-2 text-sm text-slate-400 font-medium">
                {language === "ta" 
                  ? `${comparison.playedLength} தாளங்கள் வாசிக்கப்பட்டன`
                  : `Played ${comparison.playedLength} stroke(s)`}
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertCircle size={18} />
              <span className="text-xs font-black uppercase tracking-widest">
                {language === "ta" ? "தாள இடைவெளி" : "Rhythm Timing"}
              </span>
            </div>
            {timing?.available ? (
              <div>
                <p className="text-3xl font-black text-white leading-none">
                  {timing.averageGapMs} <span className="text-sm text-slate-500 uppercase">ms avg</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-slate-400">
                    TARGET: {timing.idealGapMs}MS
                  </span>
                  {typeof timing.averageDeltaMs === "number" && (
                    <span className={`px-2 py-1 rounded text-[10px] font-mono ${timing.averageDeltaMs > 0 ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
                      {timing.averageDeltaMs > 0 ? "+" : ""}{timing.averageDeltaMs}MS
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 font-mono text-xs">{timing?.reason || "No data"}</p>
            )}
          </div>
        </div>
      )}

      {(issues?.length > 0 || suggestions?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-8 relative z-10 pt-4">
          {issues?.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                <AlertCircle size={14} />
                {language === "ta" ? "சரிசெய்ய வேண்டியவை" : "Issues"}
              </h4>
              <ul className="space-y-3">
                {issues.map((it, i) => (
                  <li key={i} className="text-sm text-slate-300 font-medium flex gap-3">
                    <span className="text-red-500 font-black">!</span>
                    {it.explanation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {suggestions?.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                <CheckCircle2 size={14} />
                {language === "ta" ? "ஆலோசனைகள்" : "Next Steps"}
              </h4>
              <ul className="space-y-3">
                {suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 font-medium flex gap-3">
                    <span className="text-emerald-500 font-black">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
