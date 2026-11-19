import React from 'react';
import { X, Sliders, Volume2, Video, Sparkles } from 'lucide-react';
import { AppSettings } from '../types/isl';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
}) => {
  if (!isOpen) return null;

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-5 max-h-[85vh] overflow-y-auto shadow-2xl z-10 animate-slideUp">
        {/* Drag handle affordance */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto -mt-1 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">App Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera & Tracking Section */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Camera & Display
          </span>

          {/* Mirror camera */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">Mirror Camera View</p>
              <p className="text-[11px] text-slate-500">Horizontal flip for selfie camera</p>
            </div>
            <input
              type="checkbox"
              checked={settings.mirrorCamera}
              onChange={(e) => updateSetting('mirrorCamera', e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Skeleton Bones */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">Show Skeleton Bones</p>
              <p className="text-[11px] text-slate-500">Draw connecting lines between hand joints</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showSkeleton}
              onChange={(e) => updateSetting('showSkeleton', e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Landmark Dots */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">Show Landmark Dots</p>
              <p className="text-[11px] text-slate-500">Display all 21 3D joint tracking points</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showLandmarks}
              onChange={(e) => updateSetting('showLandmarks', e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Translation & Voice Section */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Speech & Translation
          </span>

          {/* Speech voice language */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-200">Speech Language</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateSetting('speechLanguage', 'en-IN')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  settings.speechLanguage === 'en-IN'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                English (India)
              </button>
              <button
                onClick={() => updateSetting('speechLanguage', 'hi-IN')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  settings.speechLanguage === 'hi-IN'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी (Hindi)
              </button>
              <button
                onClick={() => updateSetting('speechLanguage', 'te-IN')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  settings.speechLanguage === 'te-IN'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                తెలుగు (Telugu)
              </button>
            </div>
          </div>

          {/* Auto-commit toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">Auto-Type Gesture</p>
              <p className="text-[11px] text-slate-500">Automatically append word when held steadily</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoCommit}
              onChange={(e) => updateSetting('autoCommit', e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Hold duration */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Hold Duration</span>
              <span className="font-mono text-amber-400">{(settings.holdDurationMs / 1000).toFixed(1)}s</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[600, 1000, 1500, 2000].map((ms) => (
                <button
                  key={ms}
                  onClick={() => updateSetting('holdDurationMs', ms)}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    settings.holdDurationMs === ms
                      ? 'bg-amber-500 text-slate-950 font-semibold border-amber-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {(ms / 1000).toFixed(1)}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full min-h-[48px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};
