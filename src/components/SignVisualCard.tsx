import React, { useState } from 'react';
import { Sparkles, Hand, Eye, Info } from 'lucide-react';
import { ISLGestureDefinition } from '../types/isl';

interface SignVisualCardProps {
  sign: ISLGestureDefinition;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const SignVisualCard: React.FC<SignVisualCardProps> = ({
  sign,
  size = 'md',
  showDetails = true,
}) => {
  const [imageError, setImageError] = useState(false);

  // If a high-res studio image exists and hasn't errored
  if (sign.imagePath && !imageError) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-[#31333f] bg-[#0e1117] group">
        <div className="aspect-[4/3] w-full relative">
          <img
            src={sign.imagePath}
            alt={`Indian Sign Language for ${sign.name}`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Subtle contrast gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1117]/90 via-transparent to-transparent flex flex-col justify-end p-3" />
        </div>

        {showDetails && (
          <div className="p-3 bg-[#1e232e] border-t border-[#31333f] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#fafafa]">{sign.name}</span>
            <span className="text-xs text-[#FF4B4B] font-hindi">{sign.hindiName}</span>
          </div>
        )}
      </div>
    );
  }

  // Specialized SVG Hand Visual Diagrams for every other ISL sign
  return (
    <div className="relative rounded-xl overflow-hidden border border-[#31333f] bg-[#0e1117] flex flex-col group">
      <div className="aspect-[4/3] w-full bg-gradient-to-br from-[#1a1f2c] via-[#0e1117] to-[#121620] relative flex items-center justify-center p-4">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#31333f_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {/* Dynamic Anatomical Hand SVG Pose */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <RenderSignSVG gestureId={sign.id} />
        </div>

        {/* Top-right gesture tag */}
        <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded text-[10px] font-mono bg-[#262730]/90 backdrop-blur-md border border-[#31333f] text-[#808495]">
          {sign.handsRequired === 'two' ? '2 Hands' : '1 Hand'}
        </div>
      </div>

      {showDetails && (
        <div className="p-3 bg-[#1e232e] border-t border-[#31333f] flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-xs font-semibold text-[#fafafa] truncate block">{sign.name}</span>
            <span className="text-[11px] text-[#808495] line-clamp-1">{sign.tips[0]}</span>
          </div>
          <span className="text-xs text-[#FF4B4B] font-hindi shrink-0 ml-2">{sign.hindiName}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Dedicated vector illustrations showing exact finger extensions,
 * joints, and tracking lines for all ISL signs
 */
function RenderSignSVG({ gestureId }: { gestureId: string }) {
  const amber = '#f59e0b';
  const cyan = '#38bdf8';
  const jointFill = '#ffffff';

  switch (gestureId) {
    case 'good':
      // Thumbs Up
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-lg">
          {/* Fist body */}
          <rect x="50" y="70" width="55" height="55" rx="14" fill="#2d3748" stroke="#4a5568" strokeWidth="2.5" />
          {/* Folded fingers lines */}
          <line x1="50" y1="84" x2="105" y2="84" stroke="#4a5568" strokeWidth="2" />
          <line x1="50" y1="98" x2="105" y2="98" stroke="#4a5568" strokeWidth="2" />
          <line x1="50" y1="112" x2="105" y2="112" stroke="#4a5568" strokeWidth="2" />
          {/* Extended Thumb pointing UP */}
          <path d="M50 85 C40 70, 42 35, 54 28 C64 22, 70 42, 68 70 Z" fill="#3b4a6b" stroke={amber} strokeWidth="3" />
          {/* Biometric joints */}
          <circle cx="58" cy="32" r="5" fill={amber} />
          <circle cx="58" cy="32" r="2.5" fill={jointFill} />
          <circle cx="54" cy="52" r="4" fill={amber} />
          <circle cx="60" cy="74" r="4" fill={amber} />
          {/* Direction indicator arrow */}
          <path d="M82 45 L82 25 M76 31 L82 25 L88 31" stroke={amber} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'bad':
      // Thumbs Down
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-lg">
          <rect x="50" y="35" width="55" height="55" rx="14" fill="#2d3748" stroke="#4a5568" strokeWidth="2.5" />
          <line x1="50" y1="49" x2="105" y2="49" stroke="#4a5568" strokeWidth="2" />
          <line x1="50" y1="63" x2="105" y2="63" stroke="#4a5568" strokeWidth="2" />
          <line x1="50" y1="77" x2="105" y2="77" stroke="#4a5568" strokeWidth="2" />
          {/* Extended Thumb pointing DOWN */}
          <path d="M50 75 C40 90, 42 125, 54 132 C64 138, 70 118, 68 90 Z" fill="#3b4a6b" stroke="#ef4444" strokeWidth="3" />
          <circle cx="58" cy="128" r="5" fill="#ef4444" />
          <circle cx="58" cy="128" r="2.5" fill={jointFill} />
        </svg>
      );

    case 'peace':
    case 'letter_v':
      // V-sign / Peace
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-lg">
          {/* Palm base */}
          <rect x="52" y="75" width="56" height="52" rx="12" fill="#2d3748" stroke="#4a5568" strokeWidth="2.5" />
          {/* Index Finger */}
          <path d="M58 75 L52 28 C51 22, 62 20, 65 26 L72 75 Z" fill="#3b4a6b" stroke={amber} strokeWidth="3" />
          {/* Middle Finger (Spread out in V) */}
          <path d="M76 75 L94 28 C97 22, 107 24, 105 31 L88 75 Z" fill="#3b4a6b" stroke={amber} strokeWidth="3" />
          {/* Folded Ring & Pinky */}
          <rect x="88" y="80" width="18" height="24" rx="8" fill="#1f2937" stroke="#4a5568" strokeWidth="2" />
          {/* Biometric Joints on tips */}
          <circle cx="58" cy="24" r="5" fill={amber} />
          <circle cx="58" cy="24" r="2.5" fill={jointFill} />
          <circle cx="100" cy="26" r="5" fill={amber} />
          <circle cx="100" cy="26" r="2.5" fill={jointFill} />
        </svg>
      );

    case 'ok':
      // OK Sign (Thumb & Index loop, 3 fingers up)
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-lg">
          {/* Extended Middle, Ring, Pinky */}
          <path d="M72 75 L74 25 C75 19, 85 19, 86 25 L86 75" fill="#3b4a6b" stroke={amber} strokeWidth="2.5" />
          <path d="M88 75 L92 30 C93 24, 102 24, 103 30 L101 75" fill="#3b4a6b" stroke={amber} strokeWidth="2.5" />
          <path d="M103 75 L108 40 C109 34, 117 35, 117 41 L114 75" fill="#3b4a6b" stroke={amber} strokeWidth="2.5" />
          {/* Circular loop formed by thumb and index */}
          <circle cx="56" cy="72" r="16" fill="none" stroke={amber} strokeWidth="3.5" />
          <circle cx="56" cy="56" r="5" fill={amber} />
          <circle cx="56" cy="56" r="2.5" fill={jointFill} />
          <circle cx="80" cy="22" r="4" fill={amber} />
          <circle cx="98" cy="27" r="4" fill={amber} />
          <circle cx="113" cy="38" r="4" fill={amber} />
        </svg>
      );

    case 'stop':
    case 'num_5':
      // Open hand (5 fingers spread)
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-lg">
          <path d="M50 85 C45 68, 60 65, 65 85 L65 125 L105 125 L105 85" fill="#2d3748" stroke="#4a5568" strokeWidth="2.5" />
          {/* 5 fingers */}
          <line x1="38" y1="72" x2="22" y2="58" stroke={amber} strokeWidth="5" strokeLinecap="round" />
          <line x1="56" y1="75" x2="52" y2="28" stroke={amber} strokeWidth="5" strokeLinecap="round" />
          <line x1="72" y1="75" x2="72" y2="22" stroke={amber} strokeWidth="5" strokeLinecap="round" />
          <line x1="88" y1="75" x2="90" y2="26" stroke={amber} strokeWidth="5" strokeLinecap="round" />
          <line x1="104" y1="78" x2="110" y2="40" stroke={amber} strokeWidth="5" strokeLinecap="round" />
          {/* Tip dots */}
          <circle cx="22" cy="58" r="4.5" fill={amber} />
          <circle cx="52" cy="28" r="4.5" fill={amber} />
          <circle cx="72" cy="22" r="4.5" fill={amber} />
          <circle cx="90" cy="26" r="4.5" fill={amber} />
          <circle cx="110" cy="40" r="4.5" fill={amber} />
        </svg>
      );

    case 'call_me':
    case 'letter_y':
      // Thumb & Pinky extended (Shaka / Phone)
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-lg">
          <rect x="55" y="65" width="50" height="50" rx="12" fill="#2d3748" stroke="#4a5568" strokeWidth="2.5" />
          {/* Thumb extending left */}
          <path d="M55 75 L24 55 C18 51, 23 42, 30 46 L58 66 Z" fill="#3b4a6b" stroke={amber} strokeWidth="3" />
          {/* Pinky extending right */}
          <path d="M105 75 L136 55 C142 51, 137 42, 130 46 L102 66 Z" fill="#3b4a6b" stroke={amber} strokeWidth="3" />
          {/* Joints */}
          <circle cx="24" cy="50" r="5" fill={amber} />
          <circle cx="24" cy="50" r="2.5" fill={jointFill} />
          <circle cx="134" cy="50" r="5" fill={amber} />
          <circle cx="134" cy="50" r="2.5" fill={jointFill} />
        </svg>
      );

    case 'num_1':
      // Single Index Extended
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-lg">
          <rect x="52" y="70" width="56" height="55" rx="12" fill="#2d3748" stroke="#4a5568" strokeWidth="2.5" />
          <line x1="52" y1="84" x2="108" y2="84" stroke="#4a5568" strokeWidth="2" />
          {/* Index upright */}
          <path d="M68 70 L68 25 C68 18, 80 18, 80 25 L80 70 Z" fill="#3b4a6b" stroke={amber} strokeWidth="3" />
          <circle cx="74" cy="22" r="5" fill={amber} />
          <circle cx="74" cy="22" r="2.5" fill={jointFill} />
        </svg>
      );

    case 'letter_l':
      // Letter L (Index upright, Thumb at 90 deg)
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-lg">
          <rect x="55" y="70" width="52" height="52" rx="12" fill="#2d3748" stroke="#4a5568" strokeWidth="2.5" />
          {/* Index pointing straight UP */}
          <path d="M70 70 L70 24 C70 18, 82 18, 82 24 L82 70 Z" fill="#3b4a6b" stroke={amber} strokeWidth="3" />
          {/* Thumb pointing 90 deg LEFT */}
          <path d="M55 85 L22 85 C16 85, 16 73, 22 73 L55 73 Z" fill="#3b4a6b" stroke={amber} strokeWidth="3" />
          <circle cx="76" cy="20" r="5" fill={amber} />
          <circle cx="19" cy="79" r="5" fill={amber} />
        </svg>
      );

    case 'thank_you':
      // Hand moving outward from chin
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-lg">
          <path d="M45 85 C45 60, 115 60, 115 85 L115 115 C115 125, 45 125, 45 115 Z" fill="#2d3748" stroke="#4a5568" strokeWidth="2.5" />
          {/* Fingers flat forward */}
          <line x1="55" y1="65" x2="55" y2="28" stroke={amber} strokeWidth="4.5" strokeLinecap="round" />
          <line x1="70" y1="65" x2="70" y2="24" stroke={amber} strokeWidth="4.5" strokeLinecap="round" />
          <line x1="85" y1="65" x2="85" y2="26" stroke={amber} strokeWidth="4.5" strokeLinecap="round" />
          <line x1="100" y1="65" x2="100" y2="34" stroke={amber} strokeWidth="4.5" strokeLinecap="round" />
          {/* Forward wave arrows */}
          <path d="M120 70 L140 85 M125 60 L145 75" stroke={cyan} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'yes':
      // Nodding fist
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-lg">
          <rect x="52" y="55" width="56" height="55" rx="14" fill="#2d3748" stroke={amber} strokeWidth="3" />
          <path d="M48 70 Q42 55 58 52 Q68 55 64 70" fill="#3b4a6b" stroke={amber} strokeWidth="2" />
          {/* Vertical bounce arrow */}
          <path d="M122 55 L122 95 M116 87 L122 95 L128 87" stroke={cyan} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'no':
      // Waving index finger
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-lg">
          <rect x="55" y="75" width="50" height="50" rx="12" fill="#2d3748" stroke="#4a5568" strokeWidth="2.5" />
          <line x1="75" y1="75" x2="75" y2="25" stroke={amber} strokeWidth="5" strokeLinecap="round" />
          <circle cx="75" cy="22" r="5" fill={amber} />
          {/* Side to side wag arrows */}
          <path d="M50 35 L40 35 M45 30 L39 35 L45 40" stroke={cyan} strokeWidth="2" strokeLinecap="round" />
          <path d="M100 35 L110 35 M105 30 L111 35 L105 40" stroke={cyan} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'letter_i':
      // Only Pinky Extended
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-lg">
          <rect x="50" y="70" width="55" height="52" rx="12" fill="#2d3748" stroke="#4a5568" strokeWidth="2.5" />
          {/* Only pinky finger up */}
          <line x1="95" y1="70" x2="98" y2="28" stroke={amber} strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="98" cy="25" r="5" fill={amber} />
          <circle cx="98" cy="25" r="2.5" fill={jointFill} />
        </svg>
      );

    default:
      // Generic clean ISL Hand Diagram
      return (
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-lg">
          <rect x="52" y="65" width="56" height="58" rx="14" fill="#2d3748" stroke="#4a5568" strokeWidth="2.5" />
          <line x1="62" y1="65" x2="62" y2="30" stroke={amber} strokeWidth="4.5" strokeLinecap="round" />
          <line x1="76" y1="65" x2="76" y2="24" stroke={amber} strokeWidth="4.5" strokeLinecap="round" />
          <line x1="90" y1="65" x2="90" y2="28" stroke={amber} strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="62" cy="28" r="4.5" fill={amber} />
          <circle cx="76" cy="22" r="4.5" fill={amber} />
          <circle cx="90" cy="26" r="4.5" fill={amber} />
        </svg>
      );
  }
}
