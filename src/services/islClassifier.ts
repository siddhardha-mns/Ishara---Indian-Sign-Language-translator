import { HandLandmarks, RecognitionResult } from '../types/isl';
import { GESTURE_BY_ID } from '../data/islDictionary';

/**
 * Geometric helper functions for 2D/3D hand landmark analysis
 */
function dist(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

interface HandFeatures {
  palmSize: number;
  isThumbExt: boolean;
  isIndexExt: boolean;
  isMiddleExt: boolean;
  isRingExt: boolean;
  isPinkyExt: boolean;
  thumbDirection: 'up' | 'down' | 'side' | 'tucked';
  pinchThumbIndex: number;
  fingertipClusterDist: number;
  openFingersCount: number;
  wrist: { x: number; y: number };
  indexTip: { x: number; y: number };
  middleTip: { x: number; y: number };
  ringTip: { x: number; y: number };
  pinkyTip: { x: number; y: number };
  thumbTip: { x: number; y: number };
}

function extractHandFeatures(lm: HandLandmarks): HandFeatures {
  const wrist = lm[0];
  const thumbCmc = lm[1];
  const thumbMcp = lm[2];
  const thumbIp = lm[3];
  const thumbTip = lm[4];

  const indexMcp = lm[5];
  const indexPip = lm[6];
  const indexDip = lm[7];
  const indexTip = lm[8];

  const middleMcp = lm[9];
  const middlePip = lm[10];
  const middleDip = lm[11];
  const middleTip = lm[12];

  const ringMcp = lm[13];
  const ringPip = lm[14];
  const ringDip = lm[15];
  const ringTip = lm[16];

  const pinkyMcp = lm[17];
  const pinkyPip = lm[18];
  const pinkyDip = lm[19];
  const pinkyTip = lm[20];

  // Palm size based on wrist to middle MCP
  const palmSize = Math.max(0.01, dist(wrist, middleMcp));

  // Distance from wrist
  const indexTipDist = dist(wrist, indexTip);
  const indexPipDist = dist(wrist, indexPip);
  const isIndexExt = indexTipDist > indexPipDist * 1.15 && indexTip.y < indexMcp.y + palmSize * 0.15;

  const middleTipDist = dist(wrist, middleTip);
  const middlePipDist = dist(wrist, middlePip);
  const isMiddleExt = middleTipDist > middlePipDist * 1.15 && middleTip.y < middleMcp.y + palmSize * 0.15;

  const ringTipDist = dist(wrist, ringTip);
  const ringPipDist = dist(wrist, ringPip);
  const isRingExt = ringTipDist > ringPipDist * 1.15 && ringTip.y < ringMcp.y + palmSize * 0.15;

  const pinkyTipDist = dist(wrist, pinkyTip);
  const pinkyPipDist = dist(wrist, pinkyPip);
  const isPinkyExt = pinkyTipDist > pinkyPipDist * 1.15 && pinkyTip.y < pinkyMcp.y + palmSize * 0.15;

  // Thumb analysis
  const thumbDistFromWrist = dist(wrist, thumbTip);
  const thumbMcpDist = dist(wrist, thumbMcp);
  const thumbFromPinkyMcp = dist(thumbTip, pinkyMcp);
  const isThumbExt = thumbDistFromWrist > thumbMcpDist * 1.25 && thumbFromPinkyMcp > palmSize * 0.8;

  let thumbDirection: 'up' | 'down' | 'side' | 'tucked' = 'side';
  if (thumbTip.y < thumbMcp.y - palmSize * 0.4) {
    thumbDirection = 'up';
  } else if (thumbTip.y > thumbMcp.y + palmSize * 0.4) {
    thumbDirection = 'down';
  } else if (thumbFromPinkyMcp < palmSize * 0.5) {
    thumbDirection = 'tucked';
  }

  const pinchThumbIndex = dist(thumbTip, indexTip) / palmSize;

  // Cluster distance for food gesture (pinched fingertips)
  const avgCluster = (
    dist(thumbTip, indexTip) +
    dist(indexTip, middleTip) +
    dist(middleTip, ringTip) +
    dist(ringTip, pinkyTip)
  ) / (4 * palmSize);

  let openFingersCount = 0;
  if (isIndexExt) openFingersCount++;
  if (isMiddleExt) openFingersCount++;
  if (isRingExt) openFingersCount++;
  if (isPinkyExt) openFingersCount++;
  if (isThumbExt) openFingersCount++;

  return {
    palmSize,
    isThumbExt,
    isIndexExt,
    isMiddleExt,
    isRingExt,
    isPinkyExt,
    thumbDirection,
    pinchThumbIndex,
    fingertipClusterDist: avgCluster,
    openFingersCount,
    wrist,
    indexTip,
    middleTip,
    ringTip,
    pinkyTip,
    thumbTip
  };
}

/**
 * Classifies raw MediaPipe hand landmarks into an ISL Gesture
 */
export function classifyISLGesture(handsLandmarks: HandLandmarks[]): RecognitionResult | null {
  if (!handsLandmarks || handsLandmarks.length === 0) {
    return null;
  }

  const now = Date.now();

  // TWO HANDS DETECTED: Check for two-handed ISL signs (Namaste, Help)
  if (handsLandmarks.length >= 2) {
    const h1 = extractHandFeatures(handsLandmarks[0]);
    const h2 = extractHandFeatures(handsLandmarks[1]);
    const avgPalm = (h1.palmSize + h2.palmSize) / 2;

    const wristsDist = dist(h1.wrist, h2.wrist) / avgPalm;
    const indexTipsDist = dist(h1.indexTip, h2.indexTip) / avgPalm;
    const middleTipsDist = dist(h1.middleTip, h2.middleTip) / avgPalm;

    // NAMASTE GESTURE:
    // Both hands vertical, index & middle extended upwards, wrists and fingertips close together
    if (
      (h1.isIndexExt && h1.isMiddleExt && h2.isIndexExt && h2.isMiddleExt) &&
      wristsDist < 1.4 &&
      indexTipsDist < 1.0 &&
      middleTipsDist < 1.0 &&
      h1.indexTip.y < h1.wrist.y &&
      h2.indexTip.y < h2.wrist.y
    ) {
      const conf = Math.min(0.98, 0.75 + (1.0 - indexTipsDist) * 0.2);
      const def = GESTURE_BY_ID.get('namaste')!;
      return {
        gestureId: 'namaste',
        name: def.name,
        hindiName: def.hindiName,
        confidence: Number(conf.toFixed(2)),
        rawConfidence: conf,
        handsCount: 2,
        timestamp: now
      };
    }

    // HELP GESTURE:
    // One hand flat horizontal base, other hand in thumbs-up resting on top of it
    const isH1Flat = !h1.isIndexExt && Math.abs(h1.wrist.y - h1.middleTip.y) < avgPalm * 0.4;
    const isH2Flat = !h2.isIndexExt && Math.abs(h2.wrist.y - h2.middleTip.y) < avgPalm * 0.4;
    const isH1ThumbsUp = h1.isThumbExt && h1.thumbDirection === 'up' && !h1.isMiddleExt && !h1.isRingExt;
    const isH2ThumbsUp = h2.isThumbExt && h2.thumbDirection === 'up' && !h2.isMiddleExt && !h2.isRingExt;

    if ((isH1Flat && isH2ThumbsUp) || (isH2Flat && isH1ThumbsUp)) {
      const def = GESTURE_BY_ID.get('help')!;
      return {
        gestureId: 'help',
        name: def.name,
        hindiName: def.hindiName,
        confidence: 0.92,
        rawConfidence: 0.92,
        handsCount: 2,
        timestamp: now
      };
    }
  }

  // SINGLE HAND GESTURES (Primary Hand)
  const h = extractHandFeatures(handsLandmarks[0]);
  const lm = handsLandmarks[0];

  // 1. Food / Eat gesture: All fingertips clustered close together in upper frame
  if (
    h.fingertipClusterDist < 0.38 &&
    !h.isIndexExt && !h.isMiddleExt && !h.isRingExt && !h.isPinkyExt &&
    h.indexTip.y < h.wrist.y
  ) {
    const def = GESTURE_BY_ID.get('food')!;
    return {
      gestureId: 'food',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.88,
      rawConfidence: 0.88,
      handsCount: 1,
      timestamp: now
    };
  }

  // 2. Good / Best of Luck / Thumbs Up
  if (
    h.isThumbExt &&
    h.thumbDirection === 'up' &&
    !h.isIndexExt &&
    !h.isMiddleExt &&
    !h.isRingExt &&
    !h.isPinkyExt
  ) {
    const def = GESTURE_BY_ID.get('good')!;
    return {
      gestureId: 'good',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.95,
      rawConfidence: 0.95,
      handsCount: 1,
      timestamp: now
    };
  }

  // 3. Bad / Dislike / Thumbs Down
  if (
    h.isThumbExt &&
    h.thumbDirection === 'down' &&
    !h.isIndexExt &&
    !h.isMiddleExt &&
    !h.isRingExt &&
    !h.isPinkyExt
  ) {
    const def = GESTURE_BY_ID.get('bad')!;
    return {
      gestureId: 'bad',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.93,
      rawConfidence: 0.93,
      handsCount: 1,
      timestamp: now
    };
  }

  // 4. I Love You (Thumb, Index, Pinky extended; Middle and Ring curled)
  if (
    h.isThumbExt &&
    h.isIndexExt &&
    h.isPinkyExt &&
    !h.isMiddleExt &&
    !h.isRingExt
  ) {
    const def = GESTURE_BY_ID.get('love')!;
    return {
      gestureId: 'love',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.94,
      rawConfidence: 0.94,
      handsCount: 1,
      timestamp: now
    };
  }

  // 5. Call Me / Phone / Letter Y (Thumb and Pinky extended, middle 3 curled)
  if (
    h.isThumbExt &&
    h.isPinkyExt &&
    !h.isIndexExt &&
    !h.isMiddleExt &&
    !h.isRingExt
  ) {
    const def = GESTURE_BY_ID.get('call_me')!;
    return {
      gestureId: 'call_me',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.93,
      rawConfidence: 0.93,
      handsCount: 1,
      timestamp: now
    };
  }

  // 6. OK Sign (Index and thumb pinch forming ring, remaining 3 extended)
  if (
    h.pinchThumbIndex < 0.28 &&
    h.isMiddleExt &&
    h.isRingExt &&
    h.isPinkyExt
  ) {
    const def = GESTURE_BY_ID.get('ok')!;
    return {
      gestureId: 'ok',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.92,
      rawConfidence: 0.92,
      handsCount: 1,
      timestamp: now
    };
  }

  // 7. Peace / Victory / Number 2 / Letter V
  if (
    h.isIndexExt &&
    h.isMiddleExt &&
    !h.isRingExt &&
    !h.isPinkyExt
  ) {
    const vSpread = dist(h.indexTip, h.middleTip) / h.palmSize;
    if (vSpread > 0.32) {
      const def = GESTURE_BY_ID.get('peace')!;
      return {
        gestureId: 'peace',
        name: def.name,
        hindiName: def.hindiName,
        confidence: 0.92,
        rawConfidence: 0.92,
        handsCount: 1,
        timestamp: now
      };
    } else {
      const def = GESTURE_BY_ID.get('num_2')!;
      return {
        gestureId: 'num_2',
        name: def.name,
        hindiName: def.hindiName,
        confidence: 0.90,
        rawConfidence: 0.90,
        handsCount: 1,
        timestamp: now
      };
    }
  }

  // 8. Number 1 / Letter D (Index extended only)
  if (
    h.isIndexExt &&
    !h.isMiddleExt &&
    !h.isRingExt &&
    !h.isPinkyExt &&
    !h.isThumbExt
  ) {
    const def = GESTURE_BY_ID.get('num_1')!;
    return {
      gestureId: 'num_1',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.91,
      rawConfidence: 0.91,
      handsCount: 1,
      timestamp: now
    };
  }

  // 9. Letter L (Index up, Thumb extended sideways at 90 deg, others curled)
  if (
    h.isIndexExt &&
    h.isThumbExt &&
    !h.isMiddleExt &&
    !h.isRingExt &&
    !h.isPinkyExt &&
    h.thumbDirection === 'side'
  ) {
    const def = GESTURE_BY_ID.get('letter_l')!;
    return {
      gestureId: 'letter_l',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.91,
      rawConfidence: 0.91,
      handsCount: 1,
      timestamp: now
    };
  }

  // 10. Water / Letter W / Number 3 (Index, Middle, Ring extended, Pinky curled)
  if (
    h.isIndexExt &&
    h.isMiddleExt &&
    h.isRingExt &&
    !h.isPinkyExt
  ) {
    const def = GESTURE_BY_ID.get('water')!;
    return {
      gestureId: 'water',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.90,
      rawConfidence: 0.90,
      handsCount: 1,
      timestamp: now
    };
  }

  // 11. Letter I (Only Pinky extended)
  if (
    !h.isIndexExt &&
    !h.isMiddleExt &&
    !h.isRingExt &&
    h.isPinkyExt &&
    !h.isThumbExt
  ) {
    const def = GESTURE_BY_ID.get('letter_i')!;
    return {
      gestureId: 'letter_i',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.91,
      rawConfidence: 0.91,
      handsCount: 1,
      timestamp: now
    };
  }

  // 12. Number 4 / Letter B (4 fingers extended, thumb folded across)
  if (
    h.isIndexExt &&
    h.isMiddleExt &&
    h.isRingExt &&
    h.isPinkyExt &&
    !h.isThumbExt
  ) {
    const def = GESTURE_BY_ID.get('letter_b')!;
    return {
      gestureId: 'letter_b',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.89,
      rawConfidence: 0.89,
      handsCount: 1,
      timestamp: now
    };
  }

  // 13. Stop / Number 5 / Thank You (All 5 extended)
  if (
    h.isIndexExt &&
    h.isMiddleExt &&
    h.isRingExt &&
    h.isPinkyExt &&
    h.isThumbExt
  ) {
    const def = GESTURE_BY_ID.get('stop')!;
    return {
      gestureId: 'stop',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.93,
      rawConfidence: 0.93,
      handsCount: 1,
      timestamp: now
    };
  }

  // 14. Letter A / Yes (Closed Fist with thumb along index)
  if (
    !h.isIndexExt &&
    !h.isMiddleExt &&
    !h.isRingExt &&
    !h.isPinkyExt &&
    h.thumbDirection !== 'down'
  ) {
    const def = GESTURE_BY_ID.get('yes')!;
    return {
      gestureId: 'yes',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.86,
      rawConfidence: 0.86,
      handsCount: 1,
      timestamp: now
    };
  }

  // 15. Letter C (Curved hand opening)
  if (
    h.pinchThumbIndex > 0.4 &&
    h.pinchThumbIndex < 0.8 &&
    !h.isIndexExt &&
    !h.isMiddleExt
  ) {
    const def = GESTURE_BY_ID.get('letter_c')!;
    return {
      gestureId: 'letter_c',
      name: def.name,
      hindiName: def.hindiName,
      confidence: 0.82,
      rawConfidence: 0.82,
      handsCount: 1,
      timestamp: now
    };
  }

  return null;
}
