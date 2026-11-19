/**
 * Types for Indian Sign Language (ISL) Recognition and MediaPipe Tracking
 */

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

export type HandLandmarks = LandmarkPoint[];

export type GestureCategory = 'greetings' | 'daily' | 'alphabet' | 'numbers' | 'emergency';

export interface ISLGestureDefinition {
  id: string;
  name: string;
  hindiName: string;
  category: GestureCategory;
  description: string;
  handsRequired: 'single' | 'two';
  culturalNote?: string;
  tips: string[];
  visualIcon?: string;
  imagePath?: string;
  keyPointsGuide: string;
}

export interface RecognitionResult {
  gestureId: string;
  name: string;
  hindiName: string;
  confidence: number;
  handsCount: number;
  rawConfidence: number;
  timestamp: number;
  source?: 'include' | 'heuristic';
}

export interface AppSettings {
  mirrorCamera: boolean;
  showSkeleton: boolean;
  showLandmarks: boolean;
  speechEnabled: boolean;
  speechLanguage: 'en-IN' | 'hi-IN' | 'te-IN';
  holdDurationMs: number; // Duration to hold gesture to commit to sentence
  autoCommit: boolean;
  minConfidence: number;
  preferredCamera: 'user' | 'environment';
}
