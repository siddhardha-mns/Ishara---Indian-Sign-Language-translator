import React from 'react';
import { Plus, Hand, Sparkles } from 'lucide-react';
import { RecognitionResult } from '../types/isl';

interface GestureHUDProps {
  currentDetection: RecognitionResult | null;
  onCommitManual: (result: RecognitionResult) => void;
  autoCommit: boolean;
}

export const GestureHUD: React.FC<GestureHUDProps> = ({
  currentDetection,
  onCommitManual,
  autoCommit,
}) => {
  if (!currentDetection) {
    return (
      <div className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between text-slate-400 min-h-[76px] transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-slate-500">
            <Hand className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-300">Ready for ISL Gestures</p>
            <p className="text-[11px] text-slate-500">Show hands in frame (Namaste, Water, Food, A-Z, etc.)</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-slate-400 font-mono">Real-time CV</span>
        </div>
      </div>
    );
  }

  const confidencePct = Math.round(currentDetection.confidence * 100);

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-lg border border-amber-500/30 rounded-2xl p-4 shadow-xl shadow-amber-500/5 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Gesture icon & Labels */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white tracking-tight truncate">
                {currentDetection.name}
              </h3>
              <span className="text-sm font-semibold text-amber-400 font-hindi">
                {currentDetection.hindiName}
              </span>
            </div>

            {/* Unboxed clean metadata per constitution */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{currentDetection.handsCount === 2 ? 'Two Hands' : 'One Hand'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-emerald-400 font-medium">{confidencePct}% Confidence</span>
              {autoCommit && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-400/90 text-[11px]">Hold to type</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Manual Commit CTA */}
        <button
          onClick={() => onCommitManual(currentDetection)}
          title="Add this word to translation transcript"
          className="min-h-[44px] px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition-all shrink-0 shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline">Add</span>
        </button>
      </div>
    </div>
  );
};
