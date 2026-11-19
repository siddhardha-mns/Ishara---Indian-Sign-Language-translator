import React, { useState } from 'react';
import { Volume2, Delete, Trash2, Copy, Check, Space, Sparkles } from 'lucide-react';
import { speechService } from '../services/speechService';
import { AppSettings } from '../types/isl';

interface TranscriptBarProps {
  sentence: string[];
  setSentence: React.Dispatch<React.SetStateAction<string[]>>;
  settings: AppSettings;
}

export const TranscriptBar: React.FC<TranscriptBarProps> = ({
  sentence,
  setSentence,
  settings,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fullText = sentence.join(' ');

  const handleSpeak = () => {
    if (!fullText.trim()) return;
    setIsSpeaking(true);
    speechService.speak(fullText, settings.speechLanguage);
    setTimeout(() => {
      setIsSpeaking(false);
    }, Math.max(1000, sentence.length * 400));
  };

  const handleAddSpace = () => {
    setSentence((prev) => [...prev, ' ']);
  };

  const handleBackspace = () => {
    setSentence((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setSentence([]);
  };

  const handleCopy = async () => {
    if (!fullText) return;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const quickPhrases = [
    { en: 'Namaste! How are you?', hi: 'नमस्ते! आप कैसे हैं?' },
    { en: 'Please help me', hi: 'कृपया मेरी मदद करें' },
    { en: 'I need help', hi: 'मुझे मदद चाहिए' },
    { en: 'Thank you very much', hi: 'बहुत-बहुत धन्यवाद' },
    { en: 'I need water', hi: 'मुझे पानी चाहिए' },
  ];

  const handleInsertPhrase = (phrase: string) => {
    setSentence((prev) => [...prev, ...phrase.split(/\s+/).filter(Boolean)]);
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Live Translation</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {sentence.length} {sentence.length === 1 ? 'word' : 'words'}
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1">
          {fullText && (
            <>
              <button
                onClick={handleCopy}
                title="Copy translation"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleClear}
                title="Clear transcript"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main sentence transcript display */}
      <div className="min-h-[64px] max-h-[120px] overflow-y-auto p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-wrap items-center gap-1.5 text-sm">
        {sentence.length === 0 ? (
          <p className="text-slate-500 text-xs italic">
            Recognized words and letters will appear here. Hold a sign steadily to auto-type.
          </p>
        ) : (
          sentence.map((word, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-medium animate-fadeIn"
            >
              {word}
            </span>
          ))
        )}
      </div>

      {/* Control bar: Speak, Space, Backspace */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSpeak}
          disabled={!fullText.trim()}
          className={`flex-1 min-h-[44px] rounded-xl flex items-center justify-center gap-2 font-semibold text-xs transition-all ${
            fullText.trim()
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-[0.98]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-slate-950' : ''}`} />
          <span>{isSpeaking ? 'Speaking...' : 'Speak Translation'}</span>
        </button>

        <button
          onClick={handleAddSpace}
          title="Add Space"
          className="min-h-[44px] min-w-[48px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1 active:scale-95 transition-all border border-slate-700/60"
        >
          <Space className="w-4 h-4" />
          <span className="text-[11px] hidden xs:inline">Space</span>
        </button>

        <button
          onClick={handleBackspace}
          disabled={sentence.length === 0}
          title="Delete last word"
          className={`min-h-[44px] min-w-[48px] rounded-xl flex items-center justify-center gap-1 transition-all border ${
            sentence.length > 0
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/60 active:scale-95'
              : 'bg-slate-800/50 text-slate-600 border-transparent cursor-not-allowed'
          }`}
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Phrase Starters */}
      <div className="pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="text-[11px] font-medium text-slate-400">Quick Phrases</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => handleInsertPhrase(phrase.en.split(' ')[0])}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium whitespace-nowrap transition-colors border border-slate-700/50 shrink-0"
            >
              {phrase.en}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
