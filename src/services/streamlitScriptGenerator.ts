/**
 * Generates an authentic, executable Python Streamlit script (streamlit_app.py)
 * using Streamlit, OpenCV, and MediaPipe for Indian Sign Language recognition.
 */
export function getStreamlitAppScript(): string {
  return `"""
Indian Sign Language (ISL) Translator - Streamlit App
Built with Streamlit, OpenCV & MediaPipe Hands
--------------------------------------------------
Requirements:
    pip install streamlit opencv-python mediapipe pyttsx3 numpy

Run:
    streamlit run streamlit_app.py
"""

import streamlit as st
import cv2
import mediapipe as mp
import numpy as np
import math
import time

st.set_page_config(
    page_title="Ishara - Indian Sign Language Translator",
    page_icon="🤟",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize MediaPipe Hands
@st.cache_resource
def load_mediapipe_hands():
    mp_hands = mp.solutions.hands
    return mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ), mp.solutions.drawing_utils, mp_hands

hands, mp_drawing, mp_hands = load_mediapipe_hands()

def distance(p1, p2):
    return math.hypot(p1.x - p2.x, p1.y - p2.y)

def classify_hand(landmarks):
    wrist = landmarks[0]
    middle_mcp = landmarks[9]
    palm_size = max(0.01, distance(wrist, middle_mcp))

    idx_ext = distance(wrist, landmarks[8]) > distance(wrist, landmarks[6]) * 1.15
    mid_ext = distance(wrist, landmarks[12]) > distance(wrist, landmarks[10]) * 1.15
    ring_ext = distance(wrist, landmarks[16]) > distance(wrist, landmarks[14]) * 1.15
    pinky_ext = distance(wrist, landmarks[20]) > distance(wrist, landmarks[18]) * 1.15

    thumb_dist = distance(wrist, landmarks[4])
    thumb_mcp_dist = distance(wrist, landmarks[2])
    thumb_ext = thumb_dist > thumb_mcp_dist * 1.25 and distance(landmarks[4], landmarks[17]) > palm_size * 0.8
    thumb_up = landmarks[4].y < landmarks[2].y - palm_size * 0.35
    thumb_down = landmarks[4].y > landmarks[2].y + palm_size * 0.35

    pinch = distance(landmarks[4], landmarks[8]) / palm_size

    cluster = (
        distance(landmarks[4], landmarks[8]) +
        distance(landmarks[8], landmarks[12]) +
        distance(landmarks[12], landmarks[16]) +
        distance(landmarks[16], landmarks[20])
    ) / (4.0 * palm_size)

    # Food / Eat
    if cluster < 0.38 and not idx_ext and not mid_ext and landmarks[8].y < wrist.y:
        return "Food / Eat", "खाना (Khana)", 0.90

    # Good / Best of Luck
    if thumb_ext and thumb_up and not idx_ext and not mid_ext and not ring_ext and not pinky_ext:
        return "Good / Best of Luck", "बढ़िया (Badhiya)", 0.95

    # Bad / Dislike
    if thumb_ext and thumb_down and not idx_ext and not mid_ext and not ring_ext and not pinky_ext:
        return "Bad / Dislike", "खराब (Kharab)", 0.92

    # I Love You
    if thumb_ext and idx_ext and pinky_ext and not mid_ext and not ring_ext:
        return "I Love You", "प्यार (Pyaar)", 0.94

    # Call Me
    if thumb_ext and pinky_ext and not idx_ext and not mid_ext and not ring_ext:
        return "Call Me / Phone", "फ़ोन करना (Phone)", 0.91

    # OK Sign
    if pinch < 0.28 and mid_ext and ring_ext and pinky_ext:
        return "OK / Perfect", "ठीक है (Theek Hai)", 0.92

    # Peace / Victory
    if idx_ext and mid_ext and not ring_ext and not pinky_ext:
        v_spread = distance(landmarks[8], landmarks[12]) / palm_size
        if v_spread > 0.32:
            return "Peace / Victory", "शान्ति (Shanti)", 0.93
        return "Number 2", "२ (Do)", 0.90

    # Number 1
    if idx_ext and not mid_ext and not ring_ext and not pinky_ext:
        if thumb_ext:
            return "Letter L", "अक्षर L", 0.91
        return "Number 1", "१ (Ek)", 0.91

    # Water
    if idx_ext and mid_ext and ring_ext and not pinky_ext:
        return "Water / Paani", "पानी (Paani)", 0.90

    # Letter I
    if pinky_ext and not idx_ext and not mid_ext and not ring_ext and not thumb_ext:
        return "Letter I", "अक्षर I", 0.90

    # Stop / 5
    if idx_ext and mid_ext and ring_ext and pinky_ext and thumb_ext:
        return "Stop / Wait", "रुको (Ruko)", 0.94

    # Yes
    if not idx_ext and not mid_ext and not ring_ext and not pinky_ext:
        return "Yes / Agree", "हाँ (Haan)", 0.88

    return None, None, 0.0

# Sidebar controls
with st.sidebar:
    st.title("🤟 Ishara ISL")
    st.caption("Indian Sign Language Real-Time CV")
    st.markdown("---")

    st.subheader("⚙️ Settings")
    min_confidence = st.slider("Confidence Threshold", 0.4, 0.95, 0.65, 0.05)
    show_skeleton = st.checkbox("Show Hand Skeleton", value=True)
    mirror_feed = st.checkbox("Mirror Camera Feed", value=True)
    voice_lang = st.radio("Voice Output", ["English (India)", "हिन्दी (Hindi)"])

    st.markdown("---")
    st.info("💡 **Tip:** Hold both palms together facing inward for **Namaste**!")

# Main Title Area
st.title("🇮🇳 Indian Sign Language (ISL) Translator")
st.caption("Real-time hand gesture recognition powered by MediaPipe Computer Vision")

# Tabs
tab1, tab2, tab3 = st.tabs(["📷 Live Camera Translation", "📖 ISL Dictionary", "ℹ️ About ISL"])

with tab1:
    col_cam, col_info = st.columns([3, 2])

    with col_cam:
        st.subheader("Live Camera Input")
        camera_img = st.camera_input("Capture sign gesture")

        if camera_img is not None:
            bytes_data = camera_img.getvalue()
            cv2_img = cv2.imdecode(np.frombuffer(bytes_data, np.uint8), cv2.IMREAD_COLOR)
            if mirror_feed:
                cv2_img = cv2.flip(cv2_img, 1)

            rgb = cv2.cvtColor(cv2_img, cv2.COLOR_BGR2RGB)
            results = hands.process(rgb)

            detected_name = None
            detected_hindi = None
            detected_conf = 0.0

            if results.multi_hand_landmarks:
                # Two handed check for Namaste
                if len(results.multi_hand_landmarks) >= 2:
                    lm1 = results.multi_hand_landmarks[0].landmark
                    lm2 = results.multi_hand_landmarks[1].landmark
                    palm = (distance(lm1[0], lm1[9]) + distance(lm2[0], lm2[9])) / 2.0
                    if distance(lm1[0], lm2[0]) / palm < 1.4 and distance(lm1[8], lm2[8]) / palm < 1.0:
                        detected_name = "Namaste / Hello"
                        detected_hindi = "नमस्ते"
                        detected_conf = 0.96

                if not detected_name:
                    for lm in results.multi_hand_landmarks:
                        name, hindi, conf = classify_hand(lm.landmark)
                        if name and conf >= min_confidence:
                            detected_name = name
                            detected_hindi = hindi
                            detected_conf = conf
                            break

                if show_skeleton:
                    for lm in results.multi_hand_landmarks:
                        mp_drawing.draw_landmarks(rgb, lm, mp_hands.HAND_CONNECTIONS)

            st.image(rgb, channels="RGB", use_column_width=True)

            with col_info:
                st.subheader("Recognition Readout")
                if detected_name:
                    st.metric(label="Detected ISL Sign", value=detected_name, delta=f"{int(detected_conf*100)}% Confidence")
                    st.success(f"**Hindi:** {detected_hindi}")
                else:
                    st.info("No clear gesture recognized yet. Make sure hands are well-lit and in frame.")

st.markdown("---")
st.caption("Made with Streamlit · MediaPipe · OpenCV for Indian Sign Language accessibility")
`;
}
