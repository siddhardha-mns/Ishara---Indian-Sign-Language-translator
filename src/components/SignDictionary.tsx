import React, { useEffect, useRef, useState } from 'react';
import { Camera, Search, Sparkles, X } from 'lucide-react';
import { mediaPipeService } from '../services/mediaPipeService';
import { ISL_GESTURES } from '../data/islDictionary';
import includeSignFrames from '../data/includeSignFrames.json';
import { getSignImageAnnotations, getSignImageOverrides, saveSignImageOverrideRemote, SignImageAnnotation, SignImageOverrides, syncSignImageOverrides } from '../services/signImageOverrides';
import { ISLGestureDefinition } from '../types/isl';
import { SignVisualCard } from './SignVisualCard';
import { saveLiveSignTemplate } from '../services/liveSignTemplates';

interface SignDictionaryProps {
  onSelectForCamera: (gestureId: string) => void;
}

export const SignDictionary: React.FC<SignDictionaryProps> = ({ onSelectForCamera }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedGesture, setSelectedGesture] = useState<ISLGestureDefinition | null>(ISL_GESTURES[0]);
  const [imageOverrides, setImageOverrides] = useState<SignImageOverrides>(() => getSignImageOverrides());
  const [imageAnnotations, setImageAnnotations] = useState(() => getSignImageAnnotations());
  const [captureTarget, setCaptureTarget] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const captureVideoRef = useRef<HTMLVideoElement>(null);
  const captureStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    syncSignImageOverrides().then((overrides) => {
      setImageOverrides(overrides);
      setImageAnnotations(getSignImageAnnotations());
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!captureTarget) return;
    let active = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        captureStreamRef.current = stream;
        if (captureVideoRef.current) {
          captureVideoRef.current.srcObject = stream;
          return captureVideoRef.current.play();
        }
      })
      .catch(() => setCaptureError('Camera access is required to capture a replacement sign image.'));
    return () => {
      active = false;
      captureStreamRef.current?.getTracks().forEach((track) => track.stop());
      captureStreamRef.current = null;
    };
  }, [captureTarget]);

  const closeCapture = () => {
    captureStreamRef.current?.getTracks().forEach((track) => track.stop());
    captureStreamRef.current = null;
    setCaptureTarget(null);
    setCaptureError(null);
  };

  const captureReplacement = async () => {
    const video = captureVideoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) {
      setCaptureError('The camera is still starting. Try again in a moment.');
      return;
    }
    const width = Math.min(video.videoWidth, 640);
    const height = Math.round(width * video.videoHeight / video.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')?.drawImage(video, 0, 0, width, height);
    try {
      await mediaPipeService.initialize();
      const result = mediaPipeService.detectVideo(video, performance.now());
      if (!result?.landmarks?.length) {
        setCaptureError('No usable hand was detected. Keep the complete hand inside the frame and try again.');
        return;
      }
      const annotation: SignImageAnnotation = {
        version: 1,
        width,
        height,
        capturedAt: new Date().toISOString(),
        hands: result.landmarks.map((landmarks, index) => ({
          handedness: result.handednesses?.[index]?.[0]?.categoryName,
          score: result.handednesses?.[index]?.[0]?.score,
          landmarks: landmarks.map(({ x, y, z }) => ({ x, y, z })),
        })),
      };
      const templateGesture = ISL_GESTURES.find((gesture) => gesture.name === captureTarget);
      const templateId = templateGesture?.id || captureTarget!.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const templateName = templateGesture?.name.split('/')[0].trim() || captureTarget!;
      saveLiveSignTemplate(templateId, templateName, templateGesture?.hindiName || '—', annotation.hands[0].landmarks);
      setCaptureError('Saving annotated sign…');
      const overrides = await saveSignImageOverrideRemote(captureTarget!, canvas.toDataURL('image/jpeg', 0.84), annotation);
      setImageOverrides(overrides);
      setImageAnnotations(getSignImageAnnotations());
      closeCapture();
    } catch {
      setCaptureError('MediaPipe could not annotate this image. Keep the hand visible and try again.');
    }
  };

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
  const includeFiltered = Object.entries(includeSignFrames).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <form
        className="flex w-full gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSearchTerm(searchInput.trim());
        }}
      >
        <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808495]" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search ISL signs (e.g. Namaste, Water, Food, A-Z)..."
          className="w-full h-10 pl-10 pr-4 bg-[#0e1117] border border-[#31333f] rounded-md text-xs text-[#fafafa] placeholder-[#808495] focus:outline-none focus:border-[#FF4B4B] transition-colors"
        />
        </div>
        <button type="submit" aria-label="Search catalogue" className="flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-[#FF4B4B] px-4 text-xs font-semibold text-white hover:bg-[#ff3333]">
          <Search className="h-3.5 w-3.5" />
          Search catalogue
        </button>
      </form>

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

            <div className="space-y-2">
              <button
                onClick={() => { setCaptureError(null); setCaptureTarget(selectedGesture.name); }}
                className="w-full h-10 rounded-md border border-[#31333f] bg-[#0e1117] hover:border-[#FF4B4B] text-[#fafafa] font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Capture image for this sign</span>
              </button>
              <button
                onClick={() => onSelectForCamera(selectedGesture.id)}
                className="w-full h-10 rounded-md bg-[#FF4B4B] hover:bg-[#ff3333] text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Try “{selectedGesture.name.split('/')[0].trim()}” with Live Camera</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#fafafa]">INCLUDE 263-sign reference gallery</h2>
            <p className="text-[11px] text-[#808495]">Representative frames from the pretrained Indian Sign Language dataset.</p>
          </div>
          <span className="text-[11px] text-[#808495]">{includeFiltered.length} signs</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-h-[620px] overflow-y-auto pr-1">
          {includeFiltered.map(([name, imagePath]) => (
            <figure key={name} className="overflow-hidden rounded-lg border border-[#31333f] bg-[#0e1117]">
              <img src={imageOverrides[name] || imagePath} alt={`INCLUDE sign: ${name}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <figcaption className="flex items-center justify-between gap-1 px-2 py-2">
                <span className="min-w-0 truncate text-[11px] font-medium text-[#fafafa]">{name}</span>
                {imageAnnotations[name] && <span className="shrink-0 text-[9px] text-emerald-300">MP ✓</span>}
                <button
                  type="button"
                  onClick={() => { setCaptureError(null); setCaptureTarget(name); }}
                  title={`Capture a replacement image for ${name}`}
                  className="shrink-0 rounded p-1 text-[#808495] hover:bg-[#31333f] hover:text-white"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {captureTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-label={`Capture image for ${captureTarget}`}>
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-[#31333f] bg-[#1e232e] p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Capture replacement image</h3>
                <p className="text-xs text-[#808495]">Target sign: {captureTarget}</p>
              </div>
              <button type="button" onClick={closeCapture} className="rounded-full p-2 text-[#808495] hover:bg-[#31333f] hover:text-white" aria-label="Close capture dialog">
                <X className="h-4 w-4" />
              </button>
            </div>
            <video ref={captureVideoRef} autoPlay playsInline muted className="aspect-[4/3] w-full rounded-xl bg-black object-cover" />
            {captureError && <p className="text-xs text-red-300">{captureError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeCapture} className="rounded-lg border border-[#31333f] px-3 py-2 text-xs text-[#808495] hover:text-white">Cancel</button>
              <button type="button" onClick={captureReplacement} className="flex items-center gap-2 rounded-lg bg-[#FF4B4B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#ff3333]">
                <Camera className="h-3.5 w-3.5" /> Capture and replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
