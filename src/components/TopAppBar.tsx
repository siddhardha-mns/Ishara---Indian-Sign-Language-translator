import React from 'react';
import { Camera, Settings, Smartphone, Monitor, BookOpen, Terminal, Sparkles } from 'lucide-react';

interface TopAppBarProps {
  activeTab: 'translate' | 'practice' | 'dictionary' | 'python';
  setActiveTab: (tab: 'translate' | 'practice' | 'dictionary' | 'python') => void;
  onOpenSettings: () => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  isMobileFrame,
  setIsMobileFrame,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('translate')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              इ
            </div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              Ishara ISL
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean) */}
        <nav className="hidden sm:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('translate')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'translate'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Translate</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'practice'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice</span>
          </button>

          <button
            onClick={() => setActiveTab('dictionary')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dictionary'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sign Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'python'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Python Script</span>
          </button>
        </nav>

        {/* Zone 3: Quick Context Actions */}
        <div className="flex items-center gap-1.5">
          {/* Mobile frame preview toggle (desktop viewport only) */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            title={isMobileFrame ? 'Expand to Desktop View' : 'Preview Mobile Frame'}
            className="hidden lg:flex min-w-[36px] h-9 px-2 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-medium gap-1.5"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-4 h-4 text-amber-400" />
                <span className="hidden xl:inline">Full View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span className="hidden xl:inline">Phone Frame</span>
              </>
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="App Settings"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
