/**
 * Generates an executable, production-ready Python script using OpenCV and MediaPipe
 * for Indian Sign Language (ISL) recognition.
 */
export function getPythonMediaPipeScript(): string {
  return `"""
Indian Sign Language (ISL) Real-Time Translator
Built with OpenCV & MediaPipe Hands
--------------------------------------------------
Requirements:
    pip install opencv-python mediapipe pyttsx3 numpy

Run:
    python isl_translator.py
"""

import cv2
import mediapipe as mp
import numpy as np
import math
import pyttsx3
import time

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Text-to-speech engine (optional)
try:
    tts = pyttsx3.init()
    tts.setProperty('rate', 150)
except Exception:
    tts = None

def distance(p1, p2):
    return math.hypot(p1.x - p2.x, p1.y - p2.y)

def classify_hand(landmarks):
    """
    Analyzes 21 MediaPipe hand landmarks and returns gesture name & Hindi label
    """
    wrist = landmarks[0]
    middle_mcp = landmarks[9]
    palm_size = max(0.01, distance(wrist, middle_mcp))

    # Check finger extensions (tip vs pip distance from wrist)
    idx_ext = distance(wrist, landmarks[8]) > distance(wrist, landmarks[6]) * 1.15
    mid_ext = distance(wrist, landmarks[12]) > distance(wrist, landmarks[10]) * 1.15
    ring_ext = distance(wrist, landmarks[16]) > distance(wrist, landmarks[14]) * 1.15
    pinky_ext = distance(wrist, landmarks[20]) > distance(wrist, landmarks[18]) * 1.15

    # Thumb extension & direction
    thumb_dist = distance(wrist, landmarks[4])
    thumb_mcp_dist = distance(wrist, landmarks[2])
    thumb_ext = thumb_dist > thumb_mcp_dist * 1.25 and distance(landmarks[4], landmarks[17]) > palm_size * 0.8
    thumb_up = landmarks[4].y < landmarks[2].y - palm_size * 0.35
    thumb_down = landmarks[4].y > landmarks[2].y + palm_size * 0.35

    # Pinch distance between thumb tip and index tip
    pinch = distance(landmarks[4], landmarks[8]) / palm_size

    # Food cluster distance (fingertips close together)
    cluster = (
        distance(landmarks[4], landmarks[8]) +
        distance(landmarks[8], landmarks[12]) +
        distance(landmarks[12], landmarks[16]) +
        distance(landmarks[16], landmarks[20])
    ) / (4.0 * palm_size)

    # 1. Food / Eat (clustered tips near face)
    if cluster < 0.38 and not idx_ext and not mid_ext and landmarks[8].y < wrist.y:
        return "Food / Eat", "खाना (Khana)"

    # 2. Good / Best of Luck (Thumbs Up)
    if thumb_ext and thumb_up and not idx_ext and not mid_ext and not ring_ext and not pinky_ext:
        return "Good / Best of Luck", "बढ़िया (Badhiya)"

    # 3. Bad / Dislike (Thumbs Down)
    if thumb_ext and thumb_down and not idx_ext and not mid_ext and not ring_ext and not pinky_ext:
        return "Bad / Dislike", "खराब (Kharab)"

    # 4. I Love You (Thumb, Index, Pinky extended)
    if thumb_ext and idx_ext and pinky_ext and not mid_ext and not ring_ext:
        return "I Love You", "प्यार (Pyaar)"

    # 5. Call Me (Thumb and Pinky extended)
    if thumb_ext and pinky_ext and not idx_ext and not mid_ext and not ring_ext:
        return "Call Me / Phone", "फ़ोन करना (Phone)"

    # 6. OK Sign (Pinch thumb & index, other 3 extended)
    if pinch < 0.28 and mid_ext and ring_ext and pinky_ext:
        return "OK / Perfect", "ठीक है (Theek Hai)"

    # 7. Peace / Victory (Index and Middle extended in V)
    if idx_ext and mid_ext and not ring_ext and not pinky_ext:
        v_spread = distance(landmarks[8], landmarks[12]) / palm_size
        if v_spread > 0.32:
            return "Peace / Victory", "शान्ति (Shanti)"
        return "Number 2", "२ (Do)"

    # 8. Number 1 (Index extended)
    if idx_ext and not mid_ext and not ring_ext and not pinky_ext:
        if thumb_ext:
            return "Letter L", "अक्षर L"
        return "Number 1", "१ (Ek)"

    # 9. Water / Letter W (Index, Middle, Ring extended)
    if idx_ext and mid_ext and ring_ext and not pinky_ext:
        return "Water / Paani", "पानी (Paani)"

    # 10. Letter I (Only Pinky extended)
    if pinky_ext and not idx_ext and not mid_ext and not ring_ext and not thumb_ext:
        return "Letter I", "अक्षर I"

    # 11. Stop / Number 5 (All 5 fingers extended)
    if idx_ext and mid_ext and ring_ext and pinky_ext and thumb_ext:
        return "Stop / Wait", "रुको (Ruko)"

    # 12. Yes / Fist
    if not idx_ext and not mid_ext and not ring_ext and not pinky_ext:
        return "Yes / Agree", "हाँ (Haan)"

    return None, None

def main():
    cap = cv2.VideoCapture(0)
    print("Starting Indian Sign Language (ISL) Translator...")
    print("Press 'q' to quit, 's' to speak current translation.")

    last_gesture = ""
    last_spoken_time = 0
    sentence = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Flip horizontally for selfie mirror effect
        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Process with MediaPipe
        results = hands.process(rgb_frame)

        detected_label = "No Sign Detected"
        detected_hindi = "कोई संकेत नहीं"

        if results.multi_hand_landmarks:
            num_hands = len(results.multi_hand_landmarks)

            # Check two-handed Namaste
            if num_hands >= 2:
                lm1 = results.multi_hand_landmarks[0].landmark
                lm2 = results.multi_hand_landmarks[1].landmark
                palm_avg = (distance(lm1[0], lm1[9]) + distance(lm2[0], lm2[9])) / 2.0
                wrist_dist = distance(lm1[0], lm2[0]) / palm_avg
                tip_dist = distance(lm1[8], lm2[8]) / palm_avg

                if wrist_dist < 1.4 and tip_dist < 1.0:
                    detected_label = "Namaste / Hello"
                    detected_hindi = "नमस्ते (Namaste)"

            # Fallback to single hand if not two-handed
            if detected_label == "No Sign Detected":
                for hand_landmarks in results.multi_hand_landmarks:
                    label, hindi = classify_hand(hand_landmarks.landmark)
                    if label:
                        detected_label = label
                        detected_hindi = hindi
                        break

            # Draw skeleton landmarks on frame
            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS,
                    mp_drawing_styles.get_default_hand_landmarks_style(),
                    mp_drawing_styles.get_default_hand_connections_style()
                )

        # Draw HUD overlays
        cv2.rectangle(frame, (20, 20), (w - 20, 100), (15, 23, 42), -1)
        cv2.putText(frame, f"ISL: {detected_label}", (35, 55),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (245, 158, 11), 2)
        cv2.putText(frame, f"Hindi: {detected_hindi}", (35, 88),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        # Sentence bar at bottom
        cv2.rectangle(frame, (20, h - 60), (w - 20, h - 20), (30, 41, 59), -1)
        sentence_str = " ".join(sentence[-6:])
        cv2.putText(frame, f"Sentence: {sentence_str}", (35, h - 35),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (203, 213, 225), 1)

        cv2.imshow('Indian Sign Language (ISL) Translator', frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('c'):
            sentence.clear()
        elif key == ord(' '):
            if detected_label != "No Sign Detected":
                sentence.append(detected_label.split('/')[0].strip())

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
`;
}
