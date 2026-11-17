# Ishara — Indian Sign Language Translator

Project reference documentation for implementation, demonstration, review, and mini-project presentation.

**Project type:** Real-time Indian Sign Language (ISL) recognition prototype  
**Frontend:** React, TypeScript, Vite, Tailwind CSS  
**Computer vision:** MediaPipe Tasks Vision Hands and Pose  
**Classifier:** AI4Bharat INCLUDE pretrained Transformer model  
**Backend:** FastAPI and PyTorch  
**Current model vocabulary:** 263 isolated INCLUDE signs  
**Documentation date:** 15 November 2026

---

## 1. Project summary

Ishara is a browser-based ISL recognition application. It captures camera frames, detects hand and body landmarks with MediaPipe, sends a temporal landmark sequence to the pretrained AI4Bharat INCLUDE model, and displays the predicted sign. Recognized signs can be held to commit them to a transcript and can be spoken using the browser speech API.

The application includes:

- Live camera translation mode
- MediaPipe hand skeleton and landmark visualization
- Simulation mode for testing without camera permission
- Practice and quiz mode
- A curated ISL dictionary
- A searchable 263-sign INCLUDE reference gallery
- English and Hindi speech settings
- Automatically started frontend and model backend with one command
- Saved MediaPipe landmark annotation data for reference frames

The project deliberately does not use YOLO. MediaPipe provides hand localization and landmarks; INCLUDE performs sign classification.

---

## 2. Problem statement

Many ISL learners and communication tools need a low-cost way to recognize signs from a normal camera. This project addresses the following problem:

> Given a live camera stream, detect the signer’s hands and body landmarks, classify a temporal sequence as an Indian Sign Language sign, and present the result as readable text and optional speech.

The current scope is isolated-sign recognition. The user holds one sign for a short period, the system recognizes it, and the committed output is appended to the transcript.

---

## 3. Objectives

### Primary objectives

1. Detect one- and two-handed ISL gestures from a browser camera.
2. Support the 263 labels available in the downloaded INCLUDE model.
3. Use MediaPipe landmarks as the common visual representation.
4. Use temporal information rather than classifying one still frame only.
5. Show confidence and provide stable hold-to-commit interaction.
6. Produce text and optional speech output.
7. Provide a simple interface suitable for demonstration and student review.

### Secondary objectives

- Provide reference images for all available INCLUDE labels.
- Start the frontend and backend together.
- Provide a repeatable model smoke test and evaluation entry point.
- Preserve readable landmark annotations for future dataset work.

---

## 4. High-level architecture

~~~text
                 Browser
┌─────────────────────────────────────────────┐
│ Camera                                      │
│   ↓                                          │
│ MediaPipe Hand Landmarker + Pose Landmarker │
│   ↓                                          │
│ 134-value frame: 25 pose + 2×21 hands      │
│   ↓                                          │
│ Temporal buffer: latest 169 frames          │
│   ↓ HTTP                                    │
└───────────────┬─────────────────────────────┘
                │ POST /api/include/predict
                ▼
┌─────────────────────────────────────────────┐
│ FastAPI backend                              │
│   INCLUDE Transformer                        │
│   263-class prediction                       │
│   label + confidence                         │
└───────────────┬─────────────────────────────┘
                ▼
Browser decision layer
  INCLUDE confidence threshold
  geometric classifier fallback
  temporal stability / hold duration
  transcript + speech
~~~

### Decision policy

1. MediaPipe extracts landmarks.
2. The frontend builds a 134-value frame.
3. Frames are accumulated up to 169 frames.
4. INCLUDE requests begin after 32 frames and are sent periodically while the camera is active.
5. If the INCLUDE result meets the configured confidence threshold, it is the primary result.
6. If INCLUDE is unavailable or below threshold, the existing geometric classifier can provide a fallback for the smaller curated gesture set.
7. The result must remain stable for the configured hold duration before auto-commit.
8. After commit, the temporal window is cleared so the next sign is not blended with the previous sign.

---

## 5. Model and feature representation

### MediaPipe input

The frontend uses the official @mediapipe/tasks-vision package and loads the hand and pose task models from official MediaPipe CDN URLs.

- Maximum hands: 2
- Hand landmarks: 21 per hand
- Pose landmarks used: 25
- Source coordinates: MediaPipe-normalized x/y, converted to the INCLUDE training scale of 1920×1080
- Frame width: 25 × 2 + 21 × 2 × 2 = 134 values

The frame layout is:

~~~text
[pose x/y for 25 points]
[hand 0 x/y for 21 points]
[hand 1 x/y for 21 points]
~~~

If a hand or pose is missing, its values are interpolated across the buffered sequence, matching the official INCLUDE preprocessing; all-missing columns fall back to zero.

### INCLUDE model

The downloaded model is:

~~~text
models/include/include_no_cnn_transformer_small.pth
~~~

The implementation in backend/model.py reconstructs the model as:

- Input linear projection: 134 → 256
- Positional embedding
- Two small BERT-style Transformer layers
- Temporal max pooling
- Dropout and 263-class linear output

The backend keeps the latest 169 frames, pads shorter sequences to 169 frames, and returns the highest-probability class.

### Backend response

~~~json
{
  "label": "president",
  "confidence": 0.8732
}
~~~

The label mapping is stored in:

~~~text
models/include/label_map_include.json
~~~

It contains 263 label-to-class-ID entries.

---

## 6. Application features

### Live Camera Translation

- Requests camera permission.
- Starts MediaPipe hand and pose detection.
- Displays the camera and landmark overlay.
- Shows FPS and INCLUDE backend status.
- Displays the current sign and confidence.
- Uses hold-to-type stability logic.
- Adds committed signs to the transcript.
- Speaks the committed result when speech is enabled.

### Simulation Mode

Simulation mode generates synthetic landmarks for the curated gesture definitions. It is useful when camera permission is unavailable, when demonstrating on a machine without a camera, or when testing UI state independently of the model.

Simulation mode does not represent INCLUDE model accuracy; it exercises the existing geometric gesture path.

### Practice and Quiz Mode

The practice screen selects a curated sign and checks the current detected gesture against the target. It is intended for interaction and demonstration, not formal assessment.

### Dictionary and reference gallery

The dictionary contains two related resources:

1. A smaller hand-authored catalog with descriptions, tips, categories, and practice actions.
2. The full INCLUDE gallery containing 139 representative JPEG frames with usable detected hands.

The gallery is searchable through an explicit Search button and lazy-loads images to limit initial browser work.

Each gallery card also has a Live Capture button. It opens the browser camera, captures a resized JPEG for the selected sign, and stores the replacement in browser local storage under `ishara.sign-image-overrides.v1`. The replacement is immediately shown in the gallery and survives page reloads on the same browser profile. It does not modify the repository’s bundled image files.

### Speech and transcript

The transcript is stored in frontend state. Consecutive duplicate commits are suppressed. The browser speech service supports English India (en-IN) and Hindi India (hi-IN).

When a full INCLUDE label has no local Hindi dictionary entry, the application speaks the English label instead of an empty placeholder. In live camera mode, INCLUDE remains primary; the MediaPipe geometric classifier is an explicit fallback for curated gestures, and the UI labels the result source.

---

## 7. Repository structure

~~~text
.
├── backend/
│   ├── include_server.py       FastAPI model server and API routes
│   ├── model.py                INCLUDE Transformer definition
│   └── requirements.txt        Python backend dependencies
├── models/include/
│   ├── include_no_cnn_transformer_small.pth
│   ├── label_map_include.json
│   └── INCLUDE-LICENSE
├── public/sign-frames/         263 representative INCLUDE JPEG frames
├── annotations/
│   ├── include_landmarks.json  MediaPipe landmarks, boxes, handedness, confidence
│   └── README.md               Annotation schema
├── scripts/
│   ├── dev.mjs                 Starts frontend and backend together
│   ├── evaluate_include.py     Evaluates saved landmark sequences
│   ├── annotate_include_frames.py
│   ├── extract_include_frames.py
│   ├── extract_include_frames_parallel.py
│   └── retry_missing_include_frames.py
├── src/
│   ├── App.tsx                 Application shell and global state
│   ├── components/             UI components
│   ├── data/                   Curated gestures and frame manifest
│   ├── services/
│   │   ├── mediaPipeService.ts MediaPipe initialization and drawing
│   │   ├── includeService.ts   Backend calls and frame construction
│   │   ├── islClassifier.ts    Geometric fallback classifier
│   │   └── speechService.ts    Browser speech output
│   └── types/                  Shared TypeScript interfaces
├── package.json
├── tsconfig.json
└── vite.config.ts
~~~

---

## 8. Installation and setup

### Prerequisites

- Node.js with npm
- Python 3.10+ recommended
- A browser with camera support
- Python environment capable of installing PyTorch and Transformers
- Network access on first run for MediaPipe CDN assets, unless those assets are later self-hosted

### Frontend installation

~~~bash
npm install
~~~

### Backend installation

Using a virtual environment is recommended:

~~~bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
~~~

### One-command development startup

~~~bash
PYTHON_BIN="$PWD/.venv/bin/python" npm run dev
~~~

If the virtual environment is not being used and python3 is configured correctly:

~~~bash
npm run dev
~~~

This starts the Vite frontend on port 3000 and the INCLUDE FastAPI backend on port 8000. Vite uses its normal fallback if the frontend port is occupied.

### Separate startup commands

~~~bash
npm run dev:frontend
npm run model:server
~~~

The model server can be configured separately from the frontend with:

~~~bash
VITE_INCLUDE_API_URL=http://localhost:8000 npm run dev:frontend
~~~

---

## 9. API reference

### GET /health

Used by the frontend to display backend status.

Example response:

~~~json
{
  "status": "ok",
  "model": "INCLUDE",
  "classes": 263,
  "device": "cpu"
}
~~~

### POST /api/include/predict

Request:

~~~json
{
  "sequence": [[0.1, 0.2, "... 134 values per frame ..."]]
}
~~~

Validation and preprocessing:

- At least 32 frames are required.
- Every frame must contain exactly 134 values.
- Only the latest 169 frames are used.
- Shorter sequences are zero-padded to 169 frames.

Invalid input returns HTTP 400. The frontend aborts requests after three seconds and falls back to the local geometric classifier where possible.

---

## 10. Reference frame and annotation data

The project contains one representative frame for every INCLUDE label:

- Frame count: 139 usable frames
- Directory: public/sign-frames/
- Approximate storage: approximately 2.0 MB after removing unusable frames
- Manifest: src/data/includeSignFrames.json

The frames were extracted from remote INCLUDE ZIP archives using byte-range requests. The full video archives were not retained in the project.

### MediaPipe annotation output

annotations/include_landmarks.json contains 139 usable-hand records.

Each detected hand stores:

- Hand index
- Handedness label and confidence
- Pixel bounding box
- Normalized bounding box
- 21 landmarks
- Normalized x/y/z
- Pixel x/y

Measured extraction result:

- 139 frames have at least one detected hand.
- Frames without usable detected hands were removed from the gallery and annotation set.

These annotations are reference metadata, not a replacement for a large supervised training dataset.

---

## 11. Evaluation and testing

### Frontend checks

~~~bash
npm run lint
npm run build
~~~

npm run lint runs TypeScript checking. npm run build performs a production Vite build.

### Backend smoke test

~~~bash
npm run model:evaluate -- --smoke-test
~~~

This loads the real INCLUDE model, runs a valid 32-frame zero-input sequence, and prints the top five model classes. It verifies model loading and tensor shape, not recognition accuracy.

### Evaluation input format

For actual evaluation, create a directory of JSON files. Each file must contain:

~~~json
{
  "label": "president",
  "sequence": [[0.0, 0.0, "... 134 values ..."], "... at least one frame ..."]
}
~~~

Run:

~~~bash
python3 scripts/evaluate_include.py --data-dir path/to/sequences
~~~

The evaluator reports sample count, top-1 accuracy, top-5 accuracy, and correct top-1/top-5 counts.

An actual accuracy claim should use held-out videos or sequences, not the single representative frames in this repository.

---

## 12. Configuration and user controls

The application settings are defined in App.tsx and controlled through the settings sheet.

| Setting | Purpose |
|---|---|
| Mirror Camera View | Mirrors the preview for a selfie-camera experience |
| Show Skeleton Bones | Displays hand connection lines |
| Show Landmark Dots | Displays hand landmark points |
| Speech Language | Selects English India or Hindi India speech |
| Auto-Type Gesture | Enables automatic commit after holding a stable sign |
| Hold Duration | Selects 0.6, 1.0, 1.5, or 2.0 seconds |
| Minimum Confidence | Filters low-confidence predictions |
| Preferred Camera | Selects front or environment camera |

---

## 13. Security, privacy, and deployment notes

- Camera frames are processed locally by MediaPipe in the browser.
- The backend receives landmark arrays rather than raw camera images.
- The current backend has permissive CORS for local development.
- CORS should be restricted to the deployed frontend origin before production deployment.
- The model server should not be exposed publicly without authentication, rate limiting, and request-size limits.
- HTTPS is required by browsers for camera access when the site is not running on localhost.
- Confirm redistribution requirements for model files and reference frames before public deployment.

---

## 14. Known limitations

1. INCLUDE is an isolated-sign recognition model, not a complete continuous ISL language model.
2. The application supports sign-by-sign transcription but does not perform grammar correction, unrestricted-motion word segmentation, or sentence-level language modeling.
3. The geometric fallback classifier covers only the curated gesture definitions; it is not a second 263-class classifier.
4. Recognition quality depends on lighting, camera angle, background, occlusion, signer variation, and hand visibility.
5. Representative frames are reference images, not a sufficient training set for a new detector.
6. No accuracy number should be reported until a labeled held-out video evaluation set is supplied.
7. MediaPipe assets are currently loaded from CDN URLs.
8. Hindi translations are not available for every INCLUDE label in the local UI metadata.
9. The startup helper assumes a usable Python executable; PYTHON_BIN can select a virtual-environment interpreter.

---

## 15. Future work

### High priority

- Collect or prepare a held-out ISL video test set.
- Measure per-class and overall top-1/top-5 accuracy.
- Add confidence calibration and an unknown-sign threshold based on validation data.
- Improve sequence segmentation for signs performed without a visible pause.
- Add a proper 263-label metadata table with descriptions and Hindi translations.

### Medium priority

- Self-host MediaPipe WASM and task model assets for offline operation.
- Restrict backend CORS and add authentication for hosted deployments.
- Add frame-rate and latency metrics for model inference.
- Add automated browser tests for simulation mode, transcript commits, and backend-offline fallback.

### Longer term

- Train or integrate a continuous ISL recognition model.
- Add language-model-based sentence correction.
- Support more vocabulary beyond INCLUDE.
- Add signer-independent validation across different lighting, cameras, and signing styles.

---

## 16. Mini-project PPT outline

### Slide 1 — Title

**Ishara: Indian Sign Language Translator**  
Real-time camera-based ISL recognition using MediaPipe and the AI4Bharat INCLUDE model.

### Slide 2 — Motivation

- Communication accessibility
- Need for low-cost camera-based assistance
- Importance of Indian Sign Language-specific data

### Slide 3 — Problem statement and objectives

Explain isolated-sign recognition, text output, speech output, and the 263-sign target vocabulary.

### Slide 4 — System architecture

Show the camera → MediaPipe → landmark sequence → FastAPI → INCLUDE → transcript/speech pipeline.

### Slide 5 — MediaPipe processing

- Two hands maximum
- 21 landmarks per hand
- 25 pose points
- 134 values per frame
- Temporal window of up to 169 frames

### Slide 6 — INCLUDE model

- AI4Bharat pretrained model
- Transformer-based temporal classifier
- 263 output classes
- Backend inference through FastAPI

### Slide 7 — User interface

Show live camera, skeleton overlay, confidence, transcript, simulation, practice, and gallery screens.

### Slide 8 — Data and reference assets

- 263 representative frames
- Landmark annotation JSON
- No full video archive stored
- MediaPipe reference annotations

### Slide 9 — Results and verification

Report build/lint status, smoke-test status, model loading, and any measured held-out accuracy when available.

### Slide 10 — Limitations

Explain isolated-sign scope, camera conditions, no current sentence grammar model, and the need for real evaluation data.

### Slide 11 — Future work

Continuous recognition, language modeling, evaluation data, offline assets, and expanded vocabulary.

### Slide 12 — Conclusion

Summarize how MediaPipe provides landmark input and INCLUDE supplies broad ISL vocabulary recognition in a practical student project.

---

## 17. Review checklist

### Functional review

- [ ] npm run dev starts the frontend and backend.
- [ ] Camera permission is granted.
- [ ] MediaPipe landmarks appear.
- [ ] INCLUDE status shows ready.
- [ ] A held sign produces a label.
- [ ] The transcript receives a committed sign.
- [ ] Speech can be enabled and disabled.
- [ ] Simulation mode works without a camera.
- [ ] Dictionary search returns curated and INCLUDE entries.
- [ ] Gallery Live Capture replaces a selected sign image and persists after reload.

### Technical review

- [ ] npm run lint passes.
- [ ] npm run build passes.
- [ ] /health reports 263 classes.
- [ ] /api/include/predict rejects malformed frame shapes.
- [ ] Smoke test loads the real model.
- [ ] Backend CORS is restricted before production deployment.
- [ ] A held-out test set is used before reporting accuracy.

### Demonstration review

- [ ] Demonstrate simulation first if camera permissions are unreliable.
- [ ] Keep the signer well lit and centered.
- [ ] Hold one sign for the configured duration.
- [ ] Show both landmark visualization and final transcript.
- [ ] Explain that the current model recognizes isolated signs.

---

## 18. Quick command reference

~~~bash
# Install frontend dependencies
npm install

# Install backend dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# Start the complete application
PYTHON_BIN="$PWD/.venv/bin/python" npm run dev

# Run frontend checks
npm run lint
npm run build

# Run backend alone
npm run model:server

# Run model smoke test
npm run model:evaluate -- --smoke-test

# Evaluate saved landmark sequences
python3 scripts/evaluate_include.py --data-dir path/to/sequences
~~~

---

## 19. Final project status

The project is an operational prototype with:

- React/Vite user interface
- Browser-side MediaPipe detection
- Locally hosted 263-class INCLUDE model
- Automatic combined startup
- Stable hold-to-commit transcript behavior
- Speech output
- Practice and simulation tooling
- Full reference gallery
- Landmark annotation metadata
- Build, type, syntax, health, and model smoke checks

The next evidence needed for a research or production claim is a labeled, held-out video evaluation set and measured recognition results.

