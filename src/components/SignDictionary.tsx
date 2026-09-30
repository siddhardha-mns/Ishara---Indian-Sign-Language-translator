import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { ISL_GESTURES } from '../data/islDictionary';
import { ISLGestureDefinition } from '../types/isl';
import { SignVisualCard } from './SignVisualCard';

interface SignDictionaryProps {
  onSelectForCamera: (gestureId: string) => void;
}

export const SignDictionary: React.FC<SignDictionaryProps> = ({ onSelectForCamera }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedGesture, setSelectedGesture] = useState<ISLGestureDefinition | null>(ISL_GESTURES[0]);

  const categories = [
    { id: 'all', label: 'All Signs' },
    { id: 'greetings', label: 'Greetings' },
    { id: 'daily', label: 'Daily' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'numbers', label: 'Numbers' },
    { id: 'alphabet', label: 'Alphabet' },
  ];

  const filtered = ISL_GESTURES.filter((g) => {
    const matchesCategory = activeCategory === 'all' || g.category === activeCategory;
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.hindiName.includes(searchTerm) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808495]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search ISL signs (e.g. Namaste, Water, Food, A-Z)..."
          className="w-full h-10 pl-10 pr-4 bg-[#0e1117] border border-[#31333f] rounded-md text-xs text-[#fafafa] placeholder-[#808495] focus:outline-none focus:border-[#FF4B4B] transition-colors"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeCategory === cat.id
                ? 'bg-[#FF4B4B] text-white font-semibold shadow-sm'
                : 'bg-[#262730] border border-[#31333f] text-[#808495] hover:text-[#fafafa]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 2-Column Catalog & Visual Card Pane */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left: Scrollable List of Signs */}
        <div className="md:col-span-6 space-y-2 max-h-[560px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center bg-[#262730]/50 rounded-lg border border-[#31333f] text-[#808495] text-xs">
              No signs match your search criteria.
            </div>
          ) : (
            filtered.map((g) => {
              const isSelected = selectedGesture?.id === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGesture(g)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FF4B4B]/10 border-[#FF4B4B] shadow-sm'
                      : 'bg-[#262730] hover:bg-[#31333f] border-[#31333f]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#fafafa]">{g.name}</span>
                    <span className="text-xs font-semibold text-[#FF4B4B] font-hindi">{g.hindiName}</span>
                  </div>
                  <p className="text-[11px] text-[#808495] line-clamp-1">{g.description}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Sign Detail Showcase with Image */}
        {selectedGesture && (
          <div className="md:col-span-6 bg-[#262730] border border-[#31333f] rounded-xl p-5 space-y-4 sticky top-16 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#fafafa] tracking-tight">{selectedGesture.name}</h3>
                <span className="text-base font-semibold text-[#FF4B4B] font-hindi">
                  {selectedGesture.hindiName}
                </span>
              </div>
              <span className="text-xs text-[#808495] bg-[#0e1117] border border-[#31333f] px-2 py-0.5 rounded-md">
                {selectedGesture.handsRequired === 'two' ? '2 Hands' : '1 Hand'}
              </span>
            </div>

            {/* Visual Image / Diagram Card for Selected Sign */}
            <div className="w-full">
              <SignVisualCard sign={selectedGesture} showDetails={false} />
            </div>

            <p className="text-xs text-[#fafafa] leading-relaxed">{selectedGesture.description}</p>

            {selectedGesture.culturalNote && (
              <div className="p-3 bg-[#0e1117] rounded-lg border border-[#31333f] space-y-1">
                <span className="text-[10px] font-semibold text-[#FF4B4B] uppercase tracking-wider block">
                  Cultural Context
                </span>
                <p className="text-[11px] text-[#808495] leading-relaxed">{selectedGesture.culturalNote}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#fafafa]">Key Landmark Formation:</span>
              <ul className="text-xs text-[#808495] space-y-1 pl-4 list-disc marker:text-[#FF4B4B]">
                {selectedGesture.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onSelectForCamera(selectedGesture.id)}
              className="w-full h-10 rounded-md bg-[#FF4B4B] hover:bg-[#ff3333] text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Practice This Sign in Camera</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
