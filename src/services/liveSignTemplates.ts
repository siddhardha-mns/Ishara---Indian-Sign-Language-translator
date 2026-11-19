import { HandLandmarks, RecognitionResult } from '../types/isl';

const KEY = 'ishara.live-sign-templates.v1';
type Template = { name: string; hindiName: string; points: number[][] };

function readTemplates(): Record<string, Template> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, Template>; }
  catch { return {}; }
}

function normalize(hand: HandLandmarks): number[][] {
  const wrist = hand[0];
  const scale = Math.max(0.001, Math.hypot(hand[9].x - wrist.x, hand[9].y - wrist.y));
  return hand.map(({ x, y }) => [(x - wrist.x) / scale, (y - wrist.y) / scale]);
}

export function saveLiveSignTemplate(id: string, name: string, hindiName: string, hand: HandLandmarks): void {
  localStorage.setItem(KEY, JSON.stringify({ ...readTemplates(), [id]: { name, hindiName, points: normalize(hand) } }));
}

export function matchLiveSignTemplate(hand: HandLandmarks): RecognitionResult | null {
  const points = normalize(hand);
  let best: { id: string; template: Template; distance: number } | null = null;
  for (const [id, template] of Object.entries(readTemplates())) {
    if (template.points.length !== points.length) continue;
    const distance = Math.sqrt(points.reduce((sum, point, i) => sum + (point[0] - template.points[i][0]) ** 2 + (point[1] - template.points[i][1]) ** 2, 0) / points.length);
    if (!best || distance < best.distance) best = { id, template, distance };
  }
  if (!best || best.distance > 0.35) return null;
  const confidence = 1 - best.distance / 0.35;
  return { gestureId: best.id, name: best.template.name, hindiName: best.template.hindiName, confidence, rawConfidence: confidence, handsCount: 1, timestamp: Date.now(), source: 'heuristic' };
}
