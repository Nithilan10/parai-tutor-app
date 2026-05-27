"use client";

import { useState } from "react";
import { Presentation, RefreshCw, Play, Zap, Eye, EyeOff } from "lucide-react";

/**
 * Demo Mode Control Panel - Quick shortcuts for live demonstrations
 * @param {{
 *   onQuickDemo?: () => void,
 *   onReset?: () => void,
 *   onShowcase?: () => void,
 *   onToggleUI?: () => void,
 *   className?: string
 * }} props
 */
export default function DemoModePanel({
  onQuickDemo,
  onReset,
  onShowcase,
  onToggleUI,
  className = "",
}) {
  const [showcaseMode, setShowcaseMode] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);

  const handleToggleUI = () => {
    setUiVisible(!uiVisible);
    onToggleUI?.(!uiVisible);
  };

  const handleShowcase = () => {
    setShowcaseMode(!showcaseMode);
    onShowcase?.(!showcaseMode);
  };

  return (
    <div className={`glass-panel-strong border-purple-500/30 rounded-2xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
          <Presentation size={16} className="text-purple-400" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-purple-400">
          Demo Controls
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onQuickDemo}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-700/10 border border-emerald-500/30 hover:border-emerald-400/50 transition-all group"
          title="Run perfect demonstration"
        >
          <Play size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-emerald-300">Perfect Demo</span>
        </button>

        <button
          onClick={onReset}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-red-600/20 to-red-700/10 border border-red-500/30 hover:border-red-400/50 transition-all group"
          title="Reset all state"
        >
          <RefreshCw size={20} className="text-red-400 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-xs font-bold text-red-300">Quick Reset</span>
        </button>

        <button
          onClick={handleShowcase}
          className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all group ${
            showcaseMode
              ? 'bg-gradient-to-br from-purple-600 to-purple-700 border-2 border-purple-400'
              : 'bg-gradient-to-br from-purple-600/20 to-purple-700/10 border border-purple-500/30 hover:border-purple-400/50'
          }`}
          title="Toggle showcase mode"
        >
          <Zap size={20} className={`group-hover:scale-110 transition-transform ${
            showcaseMode ? 'text-white' : 'text-purple-400'
          }`} />
          <span className={`text-xs font-bold ${
            showcaseMode ? 'text-white' : 'text-purple-300'
          }`}>
            {showcaseMode ? 'Showcasing' : 'Showcase'}
          </span>
        </button>

        <button
          onClick={handleToggleUI}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-slate-600/20 to-slate-700/10 border border-slate-500/30 hover:border-slate-400/50 transition-all group"
          title="Toggle UI visibility"
        >
          {uiVisible ? (
            <Eye size={20} className="text-slate-400 group-hover:scale-110 transition-transform" />
          ) : (
            <EyeOff size={20} className="text-slate-400 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-xs font-bold text-slate-300">
            {uiVisible ? 'Hide UI' : 'Show UI'}
          </span>
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="text-[10px] font-mono text-slate-500 space-y-1">
          <p><kbd className="px-1.5 py-0.5 bg-slate-800/50 rounded text-slate-400">D</kbd> Quick demo</p>
          <p><kbd className="px-1.5 py-0.5 bg-slate-800/50 rounded text-slate-400">R</kbd> Reset</p>
          <p><kbd className="px-1.5 py-0.5 bg-slate-800/50 rounded text-slate-400">S</kbd> Showcase</p>
        </div>
      </div>

      {showcaseMode && (
        <div className="mt-3 p-3 bg-purple-600/10 border border-purple-500/30 rounded-xl">
          <p className="text-xs font-bold text-purple-300 mb-2">Showcase Mode Active</p>
          <ul className="text-[10px] text-slate-400 space-y-1">
            <li>• Larger visuals</li>
            <li>• No distractions</li>
            <li>• Enhanced feedback</li>
            <li>• Optimized for presentations</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Hook for keyboard shortcuts
 */
export function useDemoModeShortcuts({ onQuickDemo, onReset, onShowcase }) {
  if (typeof window === 'undefined') return;

  const handleKeyPress = (e) => {
    // Only trigger if no input/textarea is focused
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key.toLowerCase()) {
      case 'd':
        e.preventDefault();
        onQuickDemo?.();
        break;
      case 'r':
        e.preventDefault();
        onReset?.();
        break;
      case 's':
        e.preventDefault();
        onShowcase?.();
        break;
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }
}
