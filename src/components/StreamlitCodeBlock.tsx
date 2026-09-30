import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface StreamlitCodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export const StreamlitCodeBlock: React.FC<StreamlitCodeBlockProps> = ({
  code,
  language = 'python',
  filename,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-[#31333f] bg-[#0e1117] font-mono text-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#262730] border-b border-[#31333f] text-[#808495]">
        <div className="flex items-center gap-2">
          {filename && <span className="text-[#fafafa] font-medium">{filename}</span>}
          <span className="text-[10px] uppercase">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] hover:bg-[#31333f] text-[#808495] hover:text-[#fafafa] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#09ab3b]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code body */}
      <pre className="p-4 overflow-x-auto text-[#fafafa] leading-relaxed max-h-[460px] scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
};
