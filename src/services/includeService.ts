export interface IncludePrediction {
  label: string;
  confidence: number;
}

const INCLUDE_FRAME_WIDTH = 1920;
const INCLUDE_FRAME_HEIGHT = 1080;

function interpolateMissing(sequence: number[][]): number[][] {
  const result = sequence.map((frame) => frame.slice());
  const width = result[0]?.length || 0;
  for (let column = 0; column < width; column += 1) {
    const known = result.map((frame, index) => Number.isFinite(frame[column]) ? index : -1).filter((index) => index >= 0);
    if (known.length === 0) {
      result.forEach((frame) => { frame[column] = 0; });
      continue;
    }
    result.forEach((frame, index) => {
      if (Number.isFinite(frame[column])) return;
      const previous = known.filter((knownIndex) => knownIndex < index).at(-1);
      const next = known.find((knownIndex) => knownIndex > index);
      if (previous === undefined) frame[column] = result[next!][column];
      else if (next === undefined) frame[column] = result[previous][column];
      else {
        const ratio = (index - previous) / (next - previous);
        frame[column] = result[previous][column] + (result[next][column] - result[previous][column]) * ratio;
      }
    });
  }
  return result;
}

const API_URL = import.meta.env.VITE_INCLUDE_API_URL || 'http://localhost:8000';

export async function checkIncludeHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 1500);
  try {
    const response = await fetch(`${API_URL}/health`, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function predictWithInclude(sequence: number[][]): Promise<IncludePrediction | null> {
  if (sequence.length < 32) return null;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${API_URL}/api/include/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sequence: interpolateMissing(sequence) }),
      signal: controller.signal,
    });

    if (!response.ok) return null;
    return (await response.json()) as IncludePrediction;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function buildIncludeFrame(
  pose: Array<{ x: number; y: number }> | undefined,
  hands: Array<Array<{ x: number; y: number }>>,
): number[] {
  const points = (items: Array<{ x: number; y: number }> | undefined, count: number) =>
    Array.from({ length: count }, (_, index) => [
      (items?.[index]?.x ?? Number.NaN) * INCLUDE_FRAME_WIDTH,
      (items?.[index]?.y ?? Number.NaN) * INCLUDE_FRAME_HEIGHT,
    ]).flat();

  const first25Pose = pose?.slice(0, 25);
  return [...points(first25Pose, 25), ...points(hands[0], 21), ...points(hands[1], 21)];
}

export function orderIncludeHands(
  pose: Array<{ x: number; y: number }> | undefined,
  hands: Array<Array<{ x: number; y: number }>>,
): Array<Array<{ x: number; y: number }>> {
  if (hands.length !== 1 || !pose?.[15] || !pose?.[16] || !hands[0]?.[0]) {
    return [hands[0] || [], hands[1] || []];
  }
  const wrist = hands[0][0];
  const leftDistance = Math.hypot(pose[15].x - wrist.x, pose[15].y - wrist.y);
  const rightDistance = Math.hypot(pose[16].x - wrist.x, pose[16].y - wrist.y);
  return leftDistance < rightDistance ? [[], hands[0]] : [hands[0], []];
}
