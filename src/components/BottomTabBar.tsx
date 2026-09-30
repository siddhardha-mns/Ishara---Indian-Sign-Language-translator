import React from 'react';
import { Camera, Sparkles, BookOpen, Terminal } from 'lucide-react';

interface BottomTabBarProps {
  activeTab: 'translate' | 'practice' | 'dictionary' | 'python';
  setActiveTab: (tab: 'translate' | 'practice' | 'dictionary' | 'python') => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'translate', label: 'Translate', icon: Camera },
    { id: 'practice', label: 'Practice', icon: Sparkles },
    { id: 'dictionary', label: 'Signs', icon: BookOpen },
    { id: 'python', label: 'Python', icon: Terminal },
  ] as const;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1 safe-bottom">
      <div className="grid grid-cols-4 items-center h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors relative ${
                isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-tight mt-1 ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
