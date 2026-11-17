import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Eye, EyeOff, AlertCircle, Play, Pause, Layers } from 'lucide-react';
import { mediaPipeService, drawHandLandmarks } from '../services/mediaPipeService';
import { classifyISLGesture } from '../services/islClassifier';
import { generateSyntheticLandmarks } from '../services/simulatorService';
import { buildIncludeFrame, checkIncludeHealth, orderIncludeHands, predictWithInclude, IncludePrediction } from '../services/includeService';
import { GESTURE_BY_ID } from '../data/islDictionary';
import { AppSettings, HandLandmarks, RecognitionResult } from '../types/isl';

interface CameraViewProps {
  settings: AppSettings;
  onGestureDetected: (result: RecognitionResult | null) => void;
  onGestureCommitted: (result: RecognitionResult) => void;
  isSimulating: boolean;
  simulationGestureId: string | null;
  setIsSimulating: (val: boolean) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  settings,
  onGestureDetected,
  onGestureCommitted,
  isSimulating,
  simulationGestureId,
  setIsSimulating,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [cameraState, setCameraState] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeFacingMode, setActiveFacingMode] = useState<'user' | 'environment'>(settings.preferredCamera);
  const [fps, setFps] = useState<number>(0);
  const [stabilityProgress, setStabilityProgress] = useState<number>(0); // 0 to 1
  const [includeStatus, setIncludeStatus] = useState<'checking' | 'ready' | 'offline'>('checking');
  const includeSequenceRef = useRef<number[][]>([]);
  const includePredictionRef = useRef<IncludePrediction | null>(null);
  const includeRequestInFlightRef = useRef(false);
  const includeFramesSinceRequestRef = useRef(0);

  // Gesture stability tracking
  const currentGestureIdRef = useRef<string | null>(null);
  const gestureStartTimeRef = useRef<number>(0);
  const committedGestureIdRef = useRef<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const fpsCountRef = useRef<number>(0);
  const fpsTimeRef = useRef<number>(Date.now());

  const includeToRecognition = useCallback((prediction: IncludePrediction, handsCount: number): RecognitionResult => {
    const gestureId = prediction.label.toLowerCase().replace(/[^a-z0-9]/g, '');
    const definition = GESTURE_BY_ID.get(gestureId);
    const name = definition?.name || prediction.label.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    return {
      gestureId,
      name,
      hindiName: definition?.hindiName || '—',
      confidence: prediction.confidence,
      rawConfidence: prediction.confidence,
      handsCount,
      timestamp: Date.now(),
      source: 'include',
    };
  }, []);

  // Stop camera stream safely
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Start real camera
  const startCamera = useCallback(async () => {
    setCameraState('loading');
    setErrorMessage(null);
    setIncludeStatus('checking');
    checkIncludeHealth().then((available) => setIncludeStatus(available ? 'ready' : 'offline'));
    stopCameraStream();

    try {
      // 1. Initialize MediaPipe HandLandmarker in parallel
      await Promise.all([mediaPipeService.initialize(), mediaPipeService.initializePose()]);

      // 2. Request user media with preferred facing mode
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: activeFacingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraState('active');
        setIsSimulating(false);
      }
    } catch (err: unknown) {
      console.warn('Camera or MediaPipe initialization warning:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(
        msg.includes('Permission') || msg.includes('denied')
          ? 'Camera permission was denied. You can enable Simulation Mode to test gestures instantly!'
          : 'Could not start camera. You can use Simulation Mode to test gestures.'
      );
      setCameraState('error');
    }
  }, [activeFacingMode, setIsSimulating, stopCameraStream]);

  // Flip camera (User / Environment)
  const flipCamera = () => {
    const nextMode = activeFacingMode === 'user' ? 'environment' : 'user';
    setActiveFacingMode(nextMode);
  };

  useEffect(() => {
    if (!isSimulating) {
      startCamera();
    }
    return () => {
      stopCameraStream();
    };
  }, [activeFacingMode, isSimulating, startCamera, stopCameraStream]);

  // Main Detection Loop
  useEffect(() => {
    let isRunning = true;

    const runLoop = () => {
      if (!isRunning) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      // Update FPS counter
      fpsCountRef.current++;
      const now = Date.now();
      if (now - fpsTimeRef.current >= 1000) {
        setFps(fpsCountRef.current);
        fpsCountRef.current = 0;
        fpsTimeRef.current = now;
      }

      let detectedHands: HandLandmarks[] = [];

      // A. Real-time Video Stream Mode
      if (!isSimulating && cameraState === 'active' && videoRef.current && !isPaused) {
        const video = videoRef.current;
        if (video.readyState >= 2 && canvas && ctx) {
          // Sync canvas dimensions with video
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
          }

          // Clear previous drawings
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Run MediaPipe detection
          const result = mediaPipeService.detectVideo(video, now);
          const pose = mediaPipeService.detectPose(video, now);
          if (result?.landmarks) {
            detectedHands = result.landmarks;
            const poseLandmarks = pose?.landmarks?.[0];
            includeSequenceRef.current.push(buildIncludeFrame(poseLandmarks, orderIncludeHands(poseLandmarks, detectedHands)));
            includeSequenceRef.current = includeSequenceRef.current.slice(-169);
            includeFramesSinceRequestRef.current += 1;
            if (includeSequenceRef.current.length >= 32 && includeFramesSinceRequestRef.current >= 8 && !includeRequestInFlightRef.current) {
              includeRequestInFlightRef.current = true;
              includeFramesSinceRequestRef.current = 0;
              predictWithInclude(includeSequenceRef.current)
                .then((prediction) => {
                  includePredictionRef.current = prediction;
                  setIncludeStatus(prediction ? 'ready' : 'offline');
                })
                .finally(() => { includeRequestInFlightRef.current = false; });
            }
          }
          if (detectedHands.length > 0) {
            drawHandLandmarks(ctx, detectedHands, canvas.width, canvas.height, {
              showSkeleton: settings.showSkeleton,
              showLandmarks: settings.showLandmarks,
              mirror: settings.mirrorCamera,
            });
          }
        }
      }

      // B. Simulation / Test Mode (generates synthetic landmarks)
      if (isSimulating && simulationGestureId && canvas && ctx) {
        if (canvas.width !== 640 || canvas.height !== 480) {
          canvas.width = 640;
          canvas.height = 480;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        detectedHands = generateSyntheticLandmarks(simulationGestureId, 0.003);
        drawHandLandmarks(ctx, detectedHands, canvas.width, canvas.height, {
          showSkeleton: settings.showSkeleton,
          showLandmarks: settings.showLandmarks,
          mirror: false,
        });
      }

      // Classify detected or simulated hands
      if (detectedHands.length > 0) {
        const recognition = classifyISLGesture(detectedHands);
        if (recognition) recognition.source = 'heuristic';

        const includeRecognition = includePredictionRef.current
          ? includeToRecognition(includePredictionRef.current, detectedHands.length)
          : null;
        const selectedRecognition = isSimulating
          ? recognition
          : includeRecognition && includeRecognition.confidence >= settings.minConfidence
            ? includeRecognition
            : recognition;

        if (selectedRecognition && selectedRecognition.confidence >= settings.minConfidence) {
          onGestureDetected(selectedRecognition);

          // Stability tracking for auto-commit
          if (currentGestureIdRef.current === selectedRecognition.gestureId) {
            const elapsed = now - gestureStartTimeRef.current;
            const progress = Math.min(1, elapsed / settings.holdDurationMs);
            setStabilityProgress(progress);

            if (
              settings.autoCommit &&
              progress >= 1 &&
              committedGestureIdRef.current !== selectedRecognition.gestureId
            ) {
              committedGestureIdRef.current = selectedRecognition.gestureId;
              onGestureCommitted(selectedRecognition);
              // Start the next sign with a clean temporal window.
              includePredictionRef.current = null;
              includeSequenceRef.current = [];
              includeFramesSinceRequestRef.current = 0;
            }
          } else {
            // New gesture detected
            currentGestureIdRef.current = selectedRecognition.gestureId;
            gestureStartTimeRef.current = now;
            committedGestureIdRef.current = null;
            setStabilityProgress(0);
          }
        } else {
          onGestureDetected(null);
          currentGestureIdRef.current = null;
          setStabilityProgress(0);
        }
      } else {
        includePredictionRef.current = null;
        includeSequenceRef.current = [];
        includeFramesSinceRequestRef.current = 0;
        onGestureDetected(null);
        currentGestureIdRef.current = null;
        setStabilityProgress(0);
        if (canvas && ctx && !isSimulating) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(runLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(runLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    isSimulating,
    simulationGestureId,
    cameraState,
    isPaused,
    settings,
    onGestureDetected,
    onGestureCommitted,
    includeToRecognition,
  ]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl aspect-[4/3] max-h-[58vh] flex items-center justify-center">
      {/* Video element */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isSimulating ? 'hidden' : cameraState === 'active' ? 'opacity-100' : 'opacity-0'
        } ${settings.mirrorCamera ? '-scale-x-100' : ''}`}
      />

      {/* Synthetic background when simulating */}
      {isSimulating && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center">
          <div className="text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-200">Interactive Simulation Mode</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Simulating real-time MediaPipe hand landmarks. Choose any sign below to test.
            </p>
          </div>
        </div>
      )}

      {/* Canvas overlay for skeleton & landmarks */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
      />

      {/* Top Camera Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-20">
        {/* Stream info badge */}
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-xs text-slate-300 shadow-lg">
          <span className={`w-2 h-2 rounded-full ${cameraState === 'active' && !isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>{isSimulating ? 'Simulation' : 'Camera'}</span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-[11px] text-slate-400">{fps} FPS</span>
          {!isSimulating && (
            <>
              <span className="text-slate-500">·</span>
              <span className={includeStatus === 'ready' ? 'text-emerald-400' : 'text-amber-400'}>
                INCLUDE {includeStatus === 'checking' ? '…' : includeStatus}
              </span>
            </>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {!isSimulating && (
            <>
              {/* Flip camera */}
              <button
                onClick={flipCamera}
                title="Flip Camera (Front/Rear)"
                className="w-9 h-9 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-850 active:scale-95 transition-all shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Pause / Resume */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? 'Resume Camera' : 'Pause Camera'}
                className="w-9 h-9 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-850 active:scale-95 transition-all shadow-lg"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            </>
          )}

          {/* Toggle Simulator */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            title={isSimulating ? 'Switch to Real Camera' : 'Switch to Simulation Mode'}
            className={`px-2.5 h-9 rounded-full backdrop-blur-md border flex items-center gap-1.5 text-xs font-medium transition-all shadow-lg ${
              isSimulating
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {isSimulating ? <Camera className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Live Cam' : 'Simulate'}</span>
          </button>
        </div>
      </div>

      {/* Stability Progress Line at Bottom of Video */}
      {stabilityProgress > 0 && stabilityProgress < 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-950/60 z-20">
          <div
            className="h-full bg-amber-400 transition-all duration-75 ease-linear shadow-sm shadow-amber-400/50"
            style={{ width: `${stabilityProgress * 100}%` }}
          />
        </div>
      )}

      {/* Camera Loading State */}
      {cameraState === 'loading' && !isSimulating && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 p-6 text-center z-20">
          <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-200">Initializing MediaPipe Vision Engine...</p>
          <p className="text-xs text-slate-400 max-w-xs">
            Loading neural hand landmark detector and starting camera stream
          </p>
        </div>
      )}

      {/* Camera Error / Permission Request State */}
      {cameraState === 'error' && !isSimulating && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-3 p-6 text-center z-20">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-100">Camera Access Needed</h4>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            {errorMessage || 'Camera access was blocked or is unavailable.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={startCamera}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
            >
              Try Camera Again
            </button>
            <button
              onClick={() => setIsSimulating(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              Launch Simulation Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
