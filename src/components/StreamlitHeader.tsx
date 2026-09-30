import React, { useState } from 'react';
import { Menu, MoreVertical, Play, RotateCw, ExternalLink, Moon, Sun, Smartphone, Monitor } from 'lucide-react';

interface StreamlitHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  isRunning: boolean;
  onRerun: () => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
}

export const StreamlitHeader: React.FC<StreamlitHeaderProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isRunning,
  onRerun,
  isMobileFrame,
  setIsMobileFrame,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-12 w-full bg-[#0e1117] border-b border-[#262730] px-4 flex items-center justify-between text-[#fafafa] select-none">
      {/* Left: Sidebar toggle & Streamlit Crown Icon */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="p-1.5 rounded-md hover:bg-[#262730] text-[#808495] hover:text-[#fafafa] transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5">
          {/* Streamlit Red Crown/Polygon Logo */}
          <svg className="w-5 h-5 text-[#FF4B4B]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 19.5h20L12 2zm0 4.2L18.6 18H5.4L12 6.2z"/>
          </svg>
          <span className="text-xs font-semibold tracking-wide text-[#fafafa]">
            Streamlit
          </span>
          <span className="text-[10px] text-[#808495] font-mono hidden xs:inline">
            v1.38.0
          </span>
        </div>
      </div>

      {/* Right: Running indicator, Deploy button, Mobile Frame, Menu */}
      <div className="flex items-center gap-2">
        {/* Streamlit "Running..." indicator */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-[#1e232e] text-[#808495] border border-[#31333f]">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#FF4B4B] animate-ping' : 'bg-[#09ab3b]'}`} />
          <span>{isRunning ? 'RUNNING' : 'READY'}</span>
        </div>

        {/* Desktop / Mobile Frame Switcher */}
        <button
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          title={isMobileFrame ? 'Desktop Wide Layout' : 'Mobile View Frame'}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded text-xs text-[#fafafa] bg-[#262730] hover:bg-[#31333f] border border-[#31333f] transition-colors"
        >
          {isMobileFrame ? <Monitor className="w-3.5 h-3.5 text-[#FF4B4B]" /> : <Smartphone className="w-3.5 h-3.5 text-[#FF4B4B]" />}
          <span className="text-[11px]">{isMobileFrame ? 'Full Width' : 'Mobile Frame'}</span>
        </button>

        {/* Streamlit Deploy Button */}
        <a
          href="https://share.streamlit.io"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-[#FF4B4B] hover:bg-[#ff3333] text-white transition-colors shadow-sm"
        >
          <span>Deploy</span>
        </a>

        {/* Streamlit Hamburger (⋮) Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-md hover:bg-[#262730] text-[#808495] hover:text-[#fafafa] transition-colors"
            aria-label="Streamlit options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#262730] border border-[#31333f] rounded-lg shadow-xl py-1 text-xs z-50 animate-fadeIn">
              <button
                onClick={() => {
                  onRerun();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#31333f] flex items-center justify-between text-[#fafafa]"
              >
                <span>Rerun</span>
                <span className="text-[10px] text-[#808495] font-mono">R</span>
              </button>
              <button
                onClick={() => {
                  window.location.reload();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#31333f] flex items-center justify-between text-[#fafafa]"
              >
                <span>Clear cache</span>
                <span className="text-[10px] text-[#808495] font-mono">C</span>
              </button>
              <div className="h-px bg-[#31333f] my-1" />
              <div className="px-3 py-1.5 text-[10px] text-[#808495]">
                Indian Sign Language Streamlit App
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
