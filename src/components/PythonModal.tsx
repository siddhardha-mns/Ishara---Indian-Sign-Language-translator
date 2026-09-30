import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, Play, BookOpen } from 'lucide-react';
import { getPythonMediaPipeScript } from '../services/pythonScriptGenerator';

export const PythonModal: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const scriptContent = getPythonMediaPipeScript();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([scriptContent], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'isl_translator.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Info Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Standalone Python MediaPipe Script</h3>
            <p className="text-xs text-slate-400">
              Run real-time Indian Sign Language recognition on your local machine using Python, OpenCV, and MediaPipe!
            </p>
          </div>
        </div>

        {/* Step-by-step setup commands */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-amber-400 block mb-1">
              Step 1: Install Dependencies
            </span>
            <code className="text-xs font-mono text-slate-300 block select-all">
              pip install opencv-python mediapipe pyttsx3 numpy
            </code>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-amber-400 block mb-1">
              Step 2: Run the Script
            </span>
            <code className="text-xs font-mono text-slate-300 block select-all">
              python isl_translator.py
            </code>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={handleDownload}
            className="min-h-[44px] px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-md shadow-amber-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Download isl_translator.py</span>
          </button>

          <button
            onClick={handleCopy}
            className="min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 active:scale-95 transition-all border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Python Code'}</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
          <span className="font-mono text-slate-300 font-medium">isl_translator.py</span>
          <span>Python 3.8+ · MediaPipe 0.10+</span>
        </div>

        <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[500px]">
          <code>{scriptContent}</code>
        </pre>
      </div>
    </div>
  );
};
