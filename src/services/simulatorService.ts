import { HandLandmarks } from '../types/isl';

/**
 * Generates synthetic MediaPipe hand landmarks for any ISL gesture
 * so users can test, demo, and practice even without a camera!
 */
export function generateSyntheticLandmarks(gestureId: string, jitter: number = 0.005): HandLandmarks[] {
  const noise = () => (Math.random() - 0.5) * jitter;

  // Base hand generator
  const createHand = (
    wristX: number,
    wristY: number,
    fingerStates: {
      thumb: 'up' | 'side' | 'curled' | 'pinch' | 'tucked';
      index: 'ext' | 'curled' | 'bent';
      middle: 'ext' | 'curled' | 'bent';
      ring: 'ext' | 'curled' | 'bent';
      pinky: 'ext' | 'curled' | 'bent';
    },
    scale: number = 0.28
  ): HandLandmarks => {
    const lm: HandLandmarks = [];
    // 0: Wrist
    lm[0] = { x: wristX + noise(), y: wristY + noise(), z: 0 };

    // 1-4: Thumb
    if (fingerStates.thumb === 'up') {
      lm[1] = { x: wristX - scale * 0.15 + noise(), y: wristY - scale * 0.15 + noise() };
      lm[2] = { x: wristX - scale * 0.25 + noise(), y: wristY - scale * 0.35 + noise() };
      lm[3] = { x: wristX - scale * 0.3 + noise(), y: wristY - scale * 0.55 + noise() };
      lm[4] = { x: wristX - scale * 0.35 + noise(), y: wristY - scale * 0.78 + noise() };
    } else if (fingerStates.thumb === 'side') {
      lm[1] = { x: wristX - scale * 0.2 + noise(), y: wristY - scale * 0.15 + noise() };
      lm[2] = { x: wristX - scale * 0.38 + noise(), y: wristY - scale * 0.25 + noise() };
      lm[3] = { x: wristX - scale * 0.55 + noise(), y: wristY - scale * 0.3 + noise() };
      lm[4] = { x: wristX - scale * 0.72 + noise(), y: wristY - scale * 0.32 + noise() };
    } else if (fingerStates.thumb === 'pinch') {
      lm[1] = { x: wristX - scale * 0.15 + noise(), y: wristY - scale * 0.2 + noise() };
      lm[2] = { x: wristX - scale * 0.25 + noise(), y: wristY - scale * 0.4 + noise() };
      lm[3] = { x: wristX - scale * 0.15 + noise(), y: wristY - scale * 0.55 + noise() };
      lm[4] = { x: wristX - scale * 0.05 + noise(), y: wristY - scale * 0.65 + noise() };
    } else {
      // curled / tucked
      lm[1] = { x: wristX - scale * 0.15 + noise(), y: wristY - scale * 0.15 + noise() };
      lm[2] = { x: wristX - scale * 0.2 + noise(), y: wristY - scale * 0.3 + noise() };
      lm[3] = { x: wristX - scale * 0.12 + noise(), y: wristY - scale * 0.38 + noise() };
      lm[4] = { x: wristX + scale * 0.02 + noise(), y: wristY - scale * 0.42 + noise() };
    }

    // Index (5-8)
    lm[5] = { x: wristX - scale * 0.18 + noise(), y: wristY - scale * 0.45 + noise() };
    if (fingerStates.index === 'ext') {
      lm[6] = { x: wristX - scale * 0.2 + noise(), y: wristY - scale * 0.65 + noise() };
      lm[7] = { x: wristX - scale * 0.22 + noise(), y: wristY - scale * 0.82 + noise() };
      lm[8] = { x: wristX - scale * 0.24 + noise(), y: wristY - scale * 0.98 + noise() };
    } else if (fingerStates.index === 'bent') {
      lm[6] = { x: wristX - scale * 0.18 + noise(), y: wristY - scale * 0.58 + noise() };
      lm[7] = { x: wristX - scale * 0.12 + noise(), y: wristY - scale * 0.64 + noise() };
      lm[8] = { x: wristX - scale * 0.05 + noise(), y: wristY - scale * 0.65 + noise() };
    } else {
      // curled
      lm[6] = { x: wristX - scale * 0.18 + noise(), y: wristY - scale * 0.58 + noise() };
      lm[7] = { x: wristX - scale * 0.12 + noise(), y: wristY - scale * 0.52 + noise() };
      lm[8] = { x: wristX - scale * 0.1 + noise(), y: wristY - scale * 0.46 + noise() };
    }

    // Middle (9-12)
    lm[9] = { x: wristX + noise(), y: wristY - scale * 0.48 + noise() };
    if (fingerStates.middle === 'ext') {
      lm[10] = { x: wristX + noise(), y: wristY - scale * 0.7 + noise() };
      lm[11] = { x: wristX + noise(), y: wristY - scale * 0.9 + noise() };
      lm[12] = { x: wristX + noise(), y: wristY - scale * 1.08 + noise() };
    } else {
      lm[10] = { x: wristX + noise(), y: wristY - scale * 0.6 + noise() };
      lm[11] = { x: wristX + noise(), y: wristY - scale * 0.54 + noise() };
      lm[12] = { x: wristX + noise(), y: wristY - scale * 0.48 + noise() };
    }

    // Ring (13-16)
    lm[13] = { x: wristX + scale * 0.16 + noise(), y: wristY - scale * 0.45 + noise() };
    if (fingerStates.ring === 'ext') {
      lm[14] = { x: wristX + scale * 0.18 + noise(), y: wristY - scale * 0.65 + noise() };
      lm[15] = { x: wristX + scale * 0.2 + noise(), y: wristY - scale * 0.82 + noise() };
      lm[16] = { x: wristX + scale * 0.22 + noise(), y: wristY - scale * 0.98 + noise() };
    } else {
      lm[14] = { x: wristX + scale * 0.16 + noise(), y: wristY - scale * 0.56 + noise() };
      lm[15] = { x: wristX + scale * 0.14 + noise(), y: wristY - scale * 0.5 + noise() };
      lm[16] = { x: wristX + scale * 0.12 + noise(), y: wristY - scale * 0.45 + noise() };
    }

    // Pinky (17-20)
    lm[17] = { x: wristX + scale * 0.3 + noise(), y: wristY - scale * 0.38 + noise() };
    if (fingerStates.pinky === 'ext') {
      lm[18] = { x: wristX + scale * 0.35 + noise(), y: wristY - scale * 0.55 + noise() };
      lm[19] = { x: wristX + scale * 0.38 + noise(), y: wristY - scale * 0.7 + noise() };
      lm[20] = { x: wristX + scale * 0.42 + noise(), y: wristY - scale * 0.85 + noise() };
    } else {
      lm[18] = { x: wristX + scale * 0.28 + noise(), y: wristY - scale * 0.48 + noise() };
      lm[19] = { x: wristX + scale * 0.25 + noise(), y: wristY - scale * 0.42 + noise() };
      lm[20] = { x: wristX + scale * 0.22 + noise(), y: wristY - scale * 0.38 + noise() };
    }

    return lm;
  };

  switch (gestureId) {
    case 'namaste': {
      // Two hands facing each other with vertical fingers
      const leftHand = createHand(0.44, 0.62, {
        thumb: 'side',
        index: 'ext',
        middle: 'ext',
        ring: 'ext',
        pinky: 'ext'
      }, 0.26);
      const rightHand = createHand(0.56, 0.62, {
        thumb: 'side',
        index: 'ext',
        middle: 'ext',
        ring: 'ext',
        pinky: 'ext'
      }, 0.26);
      return [leftHand, rightHand];
    }

    case 'help': {
      // Left flat palm, right thumbs-up fist resting above it
      const leftBase = createHand(0.48, 0.72, {
        thumb: 'side',
        index: 'curled',
        middle: 'curled',
        ring: 'curled',
        pinky: 'curled'
      }, 0.25);
      const rightThumbsUp = createHand(0.48, 0.55, {
        thumb: 'up',
        index: 'curled',
        middle: 'curled',
        ring: 'curled',
        pinky: 'curled'
      }, 0.25);
      return [leftBase, rightThumbsUp];
    }

    case 'good':
      return [createHand(0.5, 0.65, {
        thumb: 'up',
        index: 'curled',
        middle: 'curled',
        ring: 'curled',
        pinky: 'curled'
      })];

    case 'bad':
      return [createHand(0.5, 0.5, {
        thumb: 'side',
        index: 'curled',
        middle: 'curled',
        ring: 'curled',
        pinky: 'curled'
      })];

    case 'peace':
    case 'letter_v':
      return [createHand(0.5, 0.65, {
        thumb: 'tucked',
        index: 'ext',
        middle: 'ext',
        ring: 'curled',
        pinky: 'curled'
      })];

    case 'love':
      return [createHand(0.5, 0.65, {
        thumb: 'side',
        index: 'ext',
        middle: 'curled',
        ring: 'curled',
        pinky: 'ext'
      })];

    case 'call_me':
    case 'letter_y':
      return [createHand(0.5, 0.65, {
        thumb: 'side',
        index: 'curled',
        middle: 'curled',
        ring: 'curled',
        pinky: 'ext'
      })];

    case 'ok':
      return [createHand(0.5, 0.65, {
        thumb: 'pinch',
        index: 'bent',
        middle: 'ext',
        ring: 'ext',
        pinky: 'ext'
      })];

    case 'water':
    case 'letter_w':
    case 'num_3':
      return [createHand(0.5, 0.65, {
        thumb: 'tucked',
        index: 'ext',
        middle: 'ext',
        ring: 'ext',
        pinky: 'curled'
      })];

    case 'stop':
    case 'num_5':
      return [createHand(0.5, 0.65, {
        thumb: 'side',
        index: 'ext',
        middle: 'ext',
        ring: 'ext',
        pinky: 'ext'
      })];

    case 'num_1':
      return [createHand(0.5, 0.65, {
        thumb: 'tucked',
        index: 'ext',
        middle: 'curled',
        ring: 'curled',
        pinky: 'curled'
      })];

    case 'letter_i':
      return [createHand(0.5, 0.65, {
        thumb: 'tucked',
        index: 'curled',
        middle: 'curled',
        ring: 'curled',
        pinky: 'ext'
      })];

    case 'letter_l':
      return [createHand(0.5, 0.65, {
        thumb: 'side',
        index: 'ext',
        middle: 'curled',
        ring: 'curled',
        pinky: 'curled'
      })];

    case 'letter_b':
    case 'num_4':
      return [createHand(0.5, 0.65, {
        thumb: 'tucked',
        index: 'ext',
        middle: 'ext',
        ring: 'ext',
        pinky: 'ext'
      })];

    case 'food':
      return [createHand(0.5, 0.55, {
        thumb: 'pinch',
        index: 'bent',
        middle: 'bent',
        ring: 'bent',
        pinky: 'bent'
      })];

    case 'yes':
    case 'letter_a':
    default:
      return [createHand(0.5, 0.65, {
        thumb: 'up',
        index: 'curled',
        middle: 'curled',
        ring: 'curled',
        pinky: 'curled'
      })];
  }
}
