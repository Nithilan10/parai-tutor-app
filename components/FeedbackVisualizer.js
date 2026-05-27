"use client";

import { useMemo } from "react";
import { TrendingUp, Clock, Target, Zap } from "lucide-react";

/**
 * Enhanced feedback visualization with accuracy graphs and timing heatmap
 * @param {{
 *   report?: Object,
 *   history?: Array<{timestamp: number, accuracy: number, timing: number}>,
 *   showHeatmap?: boolean,
 *   className?: string
 * }} props
 */
export default function FeedbackVisualizer({ report, history = [], showHeatmap = true, className = "" }) {
  const accuracyPercentage = useMemo(() => {
    if (!report?.comparison) return 0;
    const { matched, targetLength } = report.comparison;
    return targetLength > 0 ? Math.round((matched / targetLength) * 100) : 0;
  }, [report]);

  const timingScore = useMemo(() => {
    if (!report?.timing?.available) return null;
    const { issues } = report.timing;
    if (!issues || issues.length === 0) return 100;
    
    // Calculate timing score based on severity
    const totalPenalty = issues.reduce((sum, issue) => {
      const penalty = issue.severity === 'high' ? 15 : 10;
      return sum + penalty;
    }, 0);
    
    return Math.max(0, 100 - totalPenalty);
  }, [report]);

  const strokeAccuracyMap = useMemo(() => {
    if (!report?.comparison?.errors) return null;
    
    const map = {};
    const totalStrokes = report.targetPattern?.length || 0;
    
    for (let i = 0; i < totalStrokes; i++) {
      map[i] = 'correct';
    }
    
    report.comparison.errors.forEach(error => {
      if (error.index !== undefined) {
        map[error.index] = error.type;
      }
    });
    
    return map;
  }, [report]);

  const timingHeatmap = useMemo(() => {
    if (!report?.timingGapComparison || !showHeatmap) return null;
    
    return report.timingGapComparison.map((gap) => {
      if (!gap) return null;
      
      const { observedGapMs, expectedGapMs, deltaMs } = gap;
      const absDeviation = Math.abs(deltaMs);
      
      let intensity = 'low';
      if (absDeviation > 200) intensity = 'high';
      else if (absDeviation > 100) intensity = 'medium';
      
      return {
        ...gap,
        intensity,
        isEarly: deltaMs < 0,
      };
    }).filter(Boolean);
  }, [report, showHeatmap]);

  if (!report) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Accuracy Gauge */}
      <div className="glass-panel p-6 rounded-2xl border-emerald-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="text-emerald-400" size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400">
              Stroke Accuracy
            </h3>
          </div>
          <div className="text-3xl font-black text-white">
            {accuracyPercentage}<span className="text-lg text-slate-500">%</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 rounded-full ${
              accuracyPercentage >= 90
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : accuracyPercentage >= 70
                ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                : 'bg-gradient-to-r from-red-500 to-red-400'
            }`}
            style={{ width: `${accuracyPercentage}%` }}
          />
          {accuracyPercentage >= 90 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>

        {/* Stroke by stroke visualization */}
        {strokeAccuracyMap && (
          <div className="mt-4 flex gap-1.5 flex-wrap">
            {Object.entries(strokeAccuracyMap).map(([idx, status]) => (
              <div
                key={idx}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  status === 'correct'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : status === 'wrong'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : status === 'missing'
                    ? 'bg-slate-700 text-slate-500 border border-slate-600'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
                title={`Beat ${parseInt(idx) + 1}: ${status}`}
              >
                {parseInt(idx) + 1}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timing Score */}
      {timingScore !== null && (
        <div className="glass-panel p-6 rounded-2xl border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="text-cyan-400" size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400">
                Timing Consistency
              </h3>
            </div>
            <div className="text-3xl font-black text-white">
              {timingScore}<span className="text-lg text-slate-500">%</span>
            </div>
          </div>
          
          {/* Timing progress bar */}
          <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 rounded-full ${
                timingScore >= 90
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400'
                  : timingScore >= 70
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : 'bg-gradient-to-r from-red-500 to-red-400'
              }`}
              style={{ width: `${timingScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Timing Heatmap */}
      {timingHeatmap && timingHeatmap.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border-purple-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-purple-400" size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest text-purple-400">
              Gap Timing Analysis
            </h3>
          </div>
          
          <div className="space-y-2">
            {timingHeatmap.map((gap, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="text-xs font-mono text-slate-400 w-16">
                  {gap.betweenStrokePositions[0]} → {gap.betweenStrokePositions[1]}
                </div>
                
                <div className="flex-1 relative h-6 bg-slate-800 rounded-lg overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 bottom-0 transition-all ${
                      gap.intensity === 'low'
                        ? 'bg-emerald-500/40'
                        : gap.intensity === 'medium'
                        ? 'bg-amber-500/40'
                        : 'bg-red-500/40'
                    }`}
                    style={{ width: '100%' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                    {gap.isEarly ? '−' : '+'}{Math.abs(gap.deltaMs)}ms
                  </div>
                </div>
                
                <div className="text-xs font-mono text-slate-500 w-16 text-right">
                  {gap.observedGapMs}ms
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex gap-4 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500/40" />
              <span className="text-slate-400">On Time</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500/40" />
              <span className="text-slate-400">Slight Off</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500/40" />
              <span className="text-slate-400">Way Off</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress History */}
      {history.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border-indigo-500/20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-indigo-400" size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">
              Practice History
            </h3>
          </div>
          
          <div className="h-32 flex items-end gap-1">
            {history.slice(-20).map((session, idx) => {
              const height = session.accuracy || 0;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm transition-all hover:opacity-80"
                  style={{ height: `${height}%` }}
                  title={`Session ${idx + 1}: ${height}% accuracy`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
