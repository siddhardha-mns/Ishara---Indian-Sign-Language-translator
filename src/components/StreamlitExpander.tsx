import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface StreamlitExpanderProps {
  label: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export const StreamlitExpander: React.FC<StreamlitExpanderProps> = ({
  label,
  defaultExpanded = false,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-[#31333f] rounded-lg overflow-hidden bg-[#0e1117] transition-all">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[#262730]/60 hover:bg-[#262730] text-xs font-semibold text-[#fafafa] transition-colors text-left"
      >
        <span>{label}</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[#808495]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[#808495]" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-[#31333f] text-xs text-[#fafafa] space-y-2 bg-[#0e1117]">
          {children}
        </div>
      )}
    </div>
  );
};
