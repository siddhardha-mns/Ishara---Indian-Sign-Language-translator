/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { StreamlitHeader } from './components/StreamlitHeader';
import { StreamlitSidebar } from './components/StreamlitSidebar';
import { StreamlitMetric } from './components/StreamlitMetrics';
import { StreamlitExpander } from './components/StreamlitExpander';
import { StreamlitCodeBlock } from './components/StreamlitCodeBlock';
import { CameraView } from './components/CameraView';
import { TranscriptBar } from './components/TranscriptBar';
import { SimulatorControls } from './components/SimulatorControls';
import { PracticeMode } from './components/PracticeMode';
import { SignDictionary } from './components/SignDictionary';
import { speechService } from './services/speechService';
import { getStreamlitAppScript } from './services/streamlitScriptGenerator';
import { AppSettings, RecognitionResult } from './types/isl';
import { DemoLanding } from './components/DemoLanding';
import { DemoLogin } from './components/DemoLogin';
import { Camera, Sparkles, BookOpen, Terminal, Plus, Volume2, Info, Download, Copy, Check } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'home' | 'login'>('home');
  const [activeTab, setActiveTab] = useState<'translate' | 'practice' | 'dictionary' | 'python'>('translate');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<AppSettings>({
    mirrorCamera: true,
    showSkeleton: true,
    showLandmarks: true,
    speechEnabled: true,
    speechLanguage: 'en-IN',
    holdDurationMs: 1000,
    autoCommit: true,
    minConfidence: 0.60,
    preferredCamera: 'user',
  });

  // Real-time gesture state
  const [currentDetection, setCurrentDetection] = useState<RecognitionResult | null>(null);
  const [sentence, setSentence] = useState<string[]>([]);

  // Simulation mode
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationGestureId, setSimulationGestureId] = useState<string | null>('namaste');

  const [copiedPython, setCopiedPython] = useState<boolean>(false);
  const streamlitScript = getStreamlitAppScript();

  // Commit gesture to transcript
  const handleCommitGesture = useCallback((result: RecognitionResult) => {
    const word = result.name.split('/')[0].trim();

    setSentence((prev) => {
      if (prev.length > 0 && prev[prev.length - 1] === word) {
        return prev;
      }
      return [...prev, word];
    });

    speechService.playCommitSound();

    if (settings.speechEnabled) {
      const speechText = settings.speechLanguage === 'hi-IN' && result.hindiName !== '—'
        ? result.hindiName
        : word;
      speechService.speak(speechText, settings.speechLanguage);
    }
  }, [settings.speechEnabled, settings.speechLanguage]);

  const handleSelectSignForCamera = (gestureId: string) => {
    setSimulationGestureId(gestureId);
    setIsSimulating(false);
    setActiveTab('translate');
  };

  const handleDownloadScript = () => {
    const blob = new Blob([streamlitScript], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'streamlit_app.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRerun = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 500);
  };

  if (!isAuthenticated) {
    return authView === 'home'
      ? <DemoLanding onLogin={() => setAuthView('login')} />
      : <DemoLogin onBack={() => setAuthView('home')} onSuccess={() => setIsAuthenticated(true)} />;
  }

  const tabs = [
    { id: 'translate', label: '📷 Live Camera Translation' },
    { id: 'practice', label: '🎯 Practice & Quiz Mode' },
    { id: 'dictionary', label: '📖 ISL Sign Catalog' },
    { id: 'python', label: '🐍 Streamlit Python Script' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0e1117] text-[#fafafa] flex flex-col font-sans">
      {/* Streamlit Top Chrome Header */}
      <StreamlitHeader
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isRunning={isRunning}
        onRerun={handleRerun}
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
      />

      {/* Streamlit Sidebar (st.sidebar) */}
      <StreamlitSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        setSettings={setSettings}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
      />

      {/* Main Streamlit App Canvas */}
      <div
        className={`flex-1 transition-all duration-200 ${
          isSidebarOpen ? 'lg:pl-80' : 'pl-0'
        } p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full`}
      >
        <div
          className={`w-full transition-all duration-300 ${
            isMobileFrame
              ? 'max-w-md mx-auto bg-[#262730]/40 p-4 rounded-3xl border border-[#31333f] shadow-2xl my-2'
              : ''
          }`}
        >
          {/* st.title & st.caption */}
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa] flex items-center gap-2">
              <span>🇮🇳</span>
              <span>Indian Sign Language (ISL) Translator</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#808495]">
              Real-time ISL recognition powered by MediaPipe landmarks and the AI4Bharat INCLUDE Transformer
            </p>
          </div>

          {/* Streamlit Tabs: st.tabs(...) */}
          <div className="border-b border-[#31333f] mb-6 flex gap-2 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap relative ${
                    isActive
                      ? 'text-[#fafafa] font-semibold'
                      : 'text-[#808495] hover:text-[#fafafa]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4B4B]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Live Camera Translation */}
          {activeTab === 'translate' && (
            <div className="space-y-6">
              {/* Streamlit 2-Column Layout: col1 (Camera), col2 (Metrics & Sentence) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Column 1: Live Video / Camera Input (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#fafafa]">
                        st.camera_input("ISL Video Stream")
                      </span>
                      <span className="text-[11px] font-mono text-[#808495]">
                        MediaPipe 21 Landmarks
                      </span>
                    </div>

                    <CameraView
                      settings={settings}
                      onGestureDetected={setCurrentDetection}
                      onGestureCommitted={handleCommitGesture}
                      isSimulating={isSimulating}
                      simulationGestureId={simulationGestureId}
                      setIsSimulating={setIsSimulating}
                    />
                  </div>

                  {/* Simulator Tray if simulating */}
                  {isSimulating && (
                    <div className="p-4 bg-[#262730] border border-[#31333f] rounded-lg">
                      <SimulatorControls
                        activeGestureId={simulationGestureId}
                        onSelectGesture={(id) => setSimulationGestureId(id)}
                      />
                    </div>
                  )}
                </div>

                {/* Column 2: Streamlit Metrics & Sentence Readout (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Streamlit Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <StreamlitMetric
                      label="DETECTED SIGN"
                      value={currentDetection ? currentDetection.name.split('/')[0].trim() : 'Waiting...'}
                      delta={currentDetection ? `${Math.round(currentDetection.confidence * 100)}% · ${currentDetection.source === 'include' ? 'INCLUDE Transformer' : currentDetection.source === 'heuristic' ? 'MediaPipe' : 'Simulation'}` : undefined}
                    />
                    <StreamlitMetric
                      label="HINDI"
                      value={currentDetection ? currentDetection.hindiName : 'कोई नहीं'}
                      delta={currentDetection ? `${currentDetection.handsCount} Hand(s)` : undefined}
                    />
                  </div>

                  {/* Manual Commit Button if auto-commit is off or instant commit */}
                  {currentDetection && (
                    <button
                      onClick={() => handleCommitGesture(currentDetection)}
                      className="w-full h-10 px-4 rounded-md bg-[#FF4B4B] hover:bg-[#ff3333] text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add "{currentDetection.name.split('/')[0].trim()}" to Transcript</span>
                    </button>
                  )}

                  {/* Sentence Transcript Bar (Streamlit style text area) */}
                  <div className="space-y-1.5">
                    <TranscriptBar
                      sentence={sentence}
                      setSentence={setSentence}
                      settings={settings}
                    />
                  </div>
                </div>
              </div>

              {/* Streamlit Expander: Cultural & Technical Info */}
              <StreamlitExpander label="ℹ️ About Indian Sign Language (ISL) Recognition" defaultExpanded={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#fafafa]">ISL Heritage & Two-Handed Structure</h4>
                    <p className="text-xs text-[#808495] leading-relaxed">
                      Indian Sign Language (ISL) is standardized by the <strong>Indian Sign Language Research and Training Centre (ISLRTC)</strong>. Unlike ASL which relies largely on one hand for spelling, ISL incorporates rich two-handed structures for cultural gestures like <strong>Namaste</strong> (two vertical palms touching at chest level) and <strong>Help (Madad)</strong>.
                    </p>
                    <p className="text-xs text-[#808495] leading-relaxed">
                      This application uses MediaPipe to detect 21 3D hand landmarks per hand, normalized against palm scale to ensure robust accuracy regardless of distance from the camera.
                    </p>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-[#31333f] aspect-[16/9] max-h-48 bg-[#0e1117]">
                    <img
                      src="/src/assets/images/isl_namaste_guide_1790772669913.jpg"
                      alt="ISL Namaste Guide"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </StreamlitExpander>
            </div>
          )}

          {/* TAB 2: Practice & Quiz Mode */}
          {activeTab === 'practice' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-6 space-y-2">
                  <span className="text-xs font-semibold text-[#808495]">Camera Verification</span>
                  <CameraView
                    settings={settings}
                    onGestureDetected={setCurrentDetection}
                    onGestureCommitted={handleCommitGesture}
                    isSimulating={isSimulating}
                    simulationGestureId={simulationGestureId}
                    setIsSimulating={setIsSimulating}
                  />
                </div>
                <div className="lg:col-span-6">
                  <PracticeMode
                    currentDetection={currentDetection}
                    onSelectPracticeSign={(id) => setSimulationGestureId(id)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ISL Catalog / Dictionary */}
          {activeTab === 'dictionary' && (
            <div className="space-y-4">
              <SignDictionary onSelectForCamera={handleSelectSignForCamera} />
            </div>
          )}

          {/* TAB 4: Streamlit Python Script */}
          {activeTab === 'python' && (
            <div className="space-y-4">
              <div className="bg-[#262730] border border-[#31333f] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#fafafa] flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-[#FF4B4B]" />
                      <span>Downloadable streamlit_app.py</span>
                    </h3>
                    <p className="text-xs text-[#808495]">
                      Run this exact Streamlit app locally on your machine with Python & MediaPipe!
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadScript}
                      className="px-3.5 py-1.5 rounded-md bg-[#FF4B4B] hover:bg-[#ff3333] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .py</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-[#0e1117] rounded-md border border-[#31333f] text-xs font-mono text-[#808495] space-y-1">
                  <p className="text-[#fafafa]"># Quickstart:</p>
                  <p>pip install streamlit opencv-python mediapipe pyttsx3 numpy</p>
                  <p>streamlit run streamlit_app.py</p>
                </div>
              </div>

              <StreamlitCodeBlock
                code={streamlitScript}
                language="python"
                filename="streamlit_app.py"
              />
            </div>
          )}

          {/* Streamlit Footer */}
          <footer className="mt-12 pt-6 border-t border-[#31333f] text-center text-xs text-[#808495] space-y-1">
            <p>Made with Streamlit · MediaPipe Hands · OpenCV for Indian Sign Language</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
