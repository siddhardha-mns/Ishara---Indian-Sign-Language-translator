import React from 'react';
import { X, ChevronDown, Check, Info, Sparkles, Layers } from 'lucide-react';
import { AppSettings } from '../types/isl';

interface StreamlitSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'translate' | 'practice' | 'dictionary' | 'python';
  setActiveTab: (tab: 'translate' | 'practice' | 'dictionary' | 'python') => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
}

export const StreamlitSidebar: React.FC<StreamlitSidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  settings,
  setSettings,
  isSimulating,
  setIsSimulating,
}) => {
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const navOptions = [
    { id: 'translate', label: '📷 Live Camera Translation' },
    { id: 'practice', label: '🎯 Practice & Quiz Mode' },
    { id: 'dictionary', label: '📖 ISL Sign Catalog' },
    { id: 'python', label: '🐍 Streamlit Python Script' },
  ] as const;

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-12 bottom-0 left-0 z-40 w-72 sm:w-80 bg-[#262730] border-r border-[#31333f] text-[#fafafa] flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:-translate-x-full'
        }`}
      >
        {/* Top title area */}
        <div className="p-4 border-b border-[#31333f] flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#fafafa] flex items-center gap-1.5">
              <span>🤟</span>
              <span>Ishara ISL</span>
            </h1>
            <p className="text-[11px] text-[#808495]">Indian Sign Language CV App</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#808495] hover:text-[#fafafa] hover:bg-[#31333f] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar content body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
          {/* st.sidebar.selectbox: Navigation */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#fafafa] block">
              Navigation Mode
            </label>
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value as any);
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full h-10 px-3 pr-8 bg-[#0e1117] border border-[#31333f] rounded-md text-xs text-[#fafafa] appearance-none focus:outline-none focus:border-[#FF4B4B] cursor-pointer"
              >
                {navOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808495] pointer-events-none" />
            </div>
          </div>

          <div className="h-px bg-[#31333f]" />

          {/* Model / Streamlit Input Mode */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#808495] uppercase tracking-wider block">
              Input Source
            </span>
            <div className="grid grid-cols-2 gap-1.5 bg-[#0e1117] p-1 rounded-md border border-[#31333f]">
              <button
                onClick={() => setIsSimulating(false)}
                className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors ${
                  !isSimulating
                    ? 'bg-[#FF4B4B] text-white shadow-sm'
                    : 'text-[#808495] hover:text-[#fafafa]'
                }`}
              >
                Webcam
              </button>
              <button
                onClick={() => setIsSimulating(true)}
                className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors ${
                  isSimulating
                    ? 'bg-[#FF4B4B] text-white shadow-sm'
                    : 'text-[#808495] hover:text-[#fafafa]'
                }`}
              >
                Simulator
              </button>
            </div>
          </div>

          {/* st.sidebar.slider: Confidence Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#fafafa] font-medium">Confidence Threshold</span>
              <span className="font-mono text-[#FF4B4B]">{Math.round(settings.minConfidence * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.4}
              max={0.95}
              step={0.05}
              value={settings.minConfidence}
              onChange={(e) => updateSetting('minConfidence', parseFloat(e.target.value))}
              className="w-full accent-[#FF4B4B] bg-[#0e1117] h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* st.sidebar.slider: Hold Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#fafafa] font-medium">Hold to Auto-Type</span>
              <span className="font-mono text-[#FF4B4B]">{(settings.holdDurationMs / 1000).toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={600}
              max={2000}
              step={200}
              value={settings.holdDurationMs}
              onChange={(e) => updateSetting('holdDurationMs', parseInt(e.target.value, 10))}
              className="w-full accent-[#FF4B4B] bg-[#0e1117] h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div className="h-px bg-[#31333f]" />

          {/* Streamlit Checkboxes: st.sidebar.checkbox */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-[#808495] uppercase tracking-wider block">
              Display & Overlays
            </span>

            <label className="flex items-center gap-2.5 cursor-pointer text-[#fafafa] hover:text-white">
              <input
                type="checkbox"
                checked={settings.showSkeleton}
                onChange={(e) => updateSetting('showSkeleton', e.target.checked)}
                className="w-4 h-4 accent-[#FF4B4B] rounded bg-[#0e1117] border-[#31333f]"
              />
              <span>Draw skeletal connections</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-[#fafafa] hover:text-white">
              <input
                type="checkbox"
                checked={settings.showLandmarks}
                onChange={(e) => updateSetting('showLandmarks', e.target.checked)}
                className="w-4 h-4 accent-[#FF4B4B] rounded bg-[#0e1117] border-[#31333f]"
              />
              <span>Show 21 3D landmark nodes</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-[#fafafa] hover:text-white">
              <input
                type="checkbox"
                checked={settings.mirrorCamera}
                onChange={(e) => updateSetting('mirrorCamera', e.target.checked)}
                className="w-4 h-4 accent-[#FF4B4B] rounded bg-[#0e1117] border-[#31333f]"
              />
              <span>Mirror camera feed (selfie)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-[#fafafa] hover:text-white">
              <input
                type="checkbox"
                checked={settings.autoCommit}
                onChange={(e) => updateSetting('autoCommit', e.target.checked)}
                className="w-4 h-4 accent-[#FF4B4B] rounded bg-[#0e1117] border-[#31333f]"
              />
              <span>Auto-append sign to sentence</span>
            </label>
          </div>

          <div className="h-px bg-[#31333f]" />

          {/* st.sidebar.radio: Voice feedback */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#808495] uppercase tracking-wider block">
              Voice Output Accent
            </span>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-[#fafafa] cursor-pointer">
                <input
                  type="radio"
                  name="voice"
                  checked={settings.speechLanguage === 'en-IN'}
                  onChange={() => updateSetting('speechLanguage', 'en-IN')}
                  className="accent-[#FF4B4B]"
                />
                <span>English (India)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#fafafa] cursor-pointer">
                <input
                  type="radio"
                  name="voice"
                  checked={settings.speechLanguage === 'hi-IN'}
                  onChange={() => updateSetting('speechLanguage', 'hi-IN')}
                  className="accent-[#FF4B4B]"
                />
                <span>हिन्दी (Hindi)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#fafafa] cursor-pointer">
                <input
                  type="radio"
                  name="voice"
                  checked={settings.speechLanguage === 'te-IN'}
                  onChange={() => updateSetting('speechLanguage', 'te-IN')}
                  className="accent-[#FF4B4B]"
                />
                <span>తెలుగు (Telugu)</span>
              </label>
            </div>
          </div>

          {/* Streamlit Callout Box: st.info */}
          <div className="p-3 bg-[#1e232e] border border-[#31333f] rounded-lg space-y-1 text-slate-300">
            <div className="flex items-center gap-1.5 text-[#0068c9] font-semibold text-[11px]">
              <Info className="w-3.5 h-3.5" />
              <span>ISL Cultural Fact</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#808495]">
              Indian Sign Language features two-handed expressions for greetings like <strong>Namaste</strong> and respect signs.
            </p>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#31333f] text-center text-[10px] text-[#808495]">
          Streamlit · MediaPipe Hands · OpenCV
        </div>
      </aside>
    </>
  );
};
