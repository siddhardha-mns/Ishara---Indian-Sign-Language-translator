import React from 'react';
import { ISL_GESTURES } from '../data/islDictionary';

interface SimulatorControlsProps {
  activeGestureId: string | null;
  onSelectGesture: (id: string) => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  activeGestureId,
  onSelectGesture,
}) => {
  const categories = [
    { id: 'all', label: 'All Signs' },
    { id: 'greetings', label: 'Greetings' },
    { id: 'daily', label: 'Daily' },
    { id: 'emergency', label: 'Essential' },
    { id: 'numbers', label: 'Numbers' },
    { id: 'alphabet', label: 'Alphabet' },
  ];

  const [activeCategory, setActiveCategory] = React.useState('all');

  const filteredGestures = ISL_GESTURES.filter((g) => {
    if (activeCategory === 'all') return true;
    return g.category === activeCategory;
  });

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-slate-200">Simulator Gestures</h4>
          <p className="text-[11px] text-slate-400">Tap any sign below to simulate hand landmarks in real-time</p>
        </div>
      </div>

      {/* Segmented Category Buttons */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeCategory === cat.id
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Gesture Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
        {filteredGestures.map((g) => {
          const isSelected = activeGestureId === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelectGesture(g.id)}
              className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-500 text-white shadow-md shadow-amber-500/10 scale-[1.02]'
                  : 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-semibold truncate">{g.name}</span>
                <span className="text-[10px] text-amber-400 font-hindi shrink-0 ml-1">{g.hindiName}</span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                {g.handsRequired === 'two' ? '2 Hands' : '1 Hand'} · {g.tips[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
