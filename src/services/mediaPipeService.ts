import { FilesetResolver, HandLandmarker, HandLandmarkerResult, PoseLandmarker, PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { HandLandmarks } from '../types/isl';

// MediaPipe Hand connections (21 landmarks)
export const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm base knuckles
  [5, 9], [9, 13], [13, 17]
];

export class MediaPipeService {
  private handLandmarker: HandLandmarker | null = null;
  private poseLandmarker: PoseLandmarker | null = null;
  private isInitializing: boolean = false;
  private initError: string | null = null;

  public async initialize(): Promise<HandLandmarker> {
    if (this.handLandmarker) {
      return this.handLandmarker;
    }
    if (this.isInitializing) {
      // wait until initialized
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (this.handLandmarker) return this.handLandmarker;
      throw new Error(this.initError || 'Failed to initialize MediaPipe Hand Landmarker');
    }

    this.isInitializing = true;
    this.initError = null;

    try {
      // Use official Google MediaPipe WASM CDN
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      // Try GPU delegate first, fallback to CPU if needed
      try {
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.4,
          minHandPresenceConfidence: 0.4,
          minTrackingConfidence: 0.4
        });
      } catch (gpuError) {
        console.warn('MediaPipe GPU initialization failed, falling back to CPU:', gpuError);
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.4,
          minHandPresenceConfidence: 0.4,
          minTrackingConfidence: 0.4
        });
      }

      this.isInitializing = false;
      return this.handLandmarker;
    } catch (err: unknown) {
      this.isInitializing = false;
      const msg = err instanceof Error ? err.message : String(err);
      this.initError = msg;
      console.error('Error initializing MediaPipe:', err);
      throw new Error(msg);
    }
  }

  public detectVideo(video: HTMLVideoElement, timestamp: number): HandLandmarkerResult | null {
    if (!this.handLandmarker) return null;
    try {
      return this.handLandmarker.detectForVideo(video, timestamp);
    } catch (e) {
      console.warn('Frame detection error:', e);
      return null;
    }
  }

  public async initializePose(): Promise<PoseLandmarker> {
    if (this.poseLandmarker) return this.poseLandmarker;
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
    );
    const options = (delegate: 'GPU' | 'CPU') => ({
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate,
      },
      runningMode: 'VIDEO' as const,
      numPoses: 1,
    });
    try {
      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, options('GPU'));
    } catch (gpuError) {
      console.warn('MediaPipe pose GPU initialization failed, falling back to CPU:', gpuError);
      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, options('CPU'));
    }
    return this.poseLandmarker;
  }

  public detectPose(video: HTMLVideoElement, timestamp: number): PoseLandmarkerResult | null {
    if (!this.poseLandmarker) return null;
    try {
      return this.poseLandmarker.detectForVideo(video, timestamp);
    } catch {
      return null;
    }
  }

  public dispose() {
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }
    if (this.poseLandmarker) {
      this.poseLandmarker.close();
      this.poseLandmarker = null;
    }
  }
}

export const mediaPipeService = new MediaPipeService();

/**
 * Draws high-contrast, visually pleasing ISL skeleton & landmark nodes on canvas
 */
export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarksList: HandLandmarks[],
  width: number,
  height: number,
  options: {
    showSkeleton: boolean;
    showLandmarks: boolean;
    mirror: boolean;
  }
) {
  ctx.save();

  for (let hIdx = 0; hIdx < landmarksList.length; hIdx++) {
    const landmarks = landmarksList[hIdx];
    const isPrimaryHand = hIdx === 0;

    // Palette: warm saffron amber for primary hand, cyan/emerald for second hand
    const boneColor = isPrimaryHand ? 'rgba(245, 158, 11, 0.75)' : 'rgba(56, 189, 248, 0.75)';
    const jointColor = isPrimaryHand ? '#f59e0b' : '#38bdf8';
    const tipColor = isPrimaryHand ? '#fbbf24' : '#7dd3fc';

    // 1. Draw Skeleton Bones
    if (options.showSkeleton) {
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = boneColor;

      for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
        const p1 = landmarks[startIdx];
        const p2 = landmarks[endIdx];
        if (!p1 || !p2) continue;

        const x1 = options.mirror ? (1 - p1.x) * width : p1.x * width;
        const y1 = p1.y * height;
        const x2 = options.mirror ? (1 - p2.x) * width : p2.x * width;
        const y2 = p2.y * height;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // 2. Draw Landmark Joints
    if (options.showLandmarks) {
      const tipIndices = new Set([4, 8, 12, 16, 20]);

      for (let i = 0; i < landmarks.length; i++) {
        const p = landmarks[i];
        if (!p) continue;

        const x = options.mirror ? (1 - p.x) * width : p.x * width;
        const y = p.y * height;
        const isTip = tipIndices.has(i);
        const radius = isTip ? 5.5 : (i === 0 ? 6 : 3.5);

        // Outer glow
        ctx.beginPath();
        ctx.arc(x, y, radius + 2, 0, 2 * Math.PI);
        ctx.fillStyle = isTip ? 'rgba(251, 191, 36, 0.3)' : 'rgba(15, 23, 42, 0.4)';
        ctx.fill();

        // Inner node
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isTip ? tipColor : jointColor;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}
