"""Generate MediaPipe hand landmarks and boxes for INCLUDE representative frames."""

import json
import re
from pathlib import Path

import cv2
import mediapipe as mp

ROOT = Path(__file__).resolve().parents[1]
FRAMES = ROOT / 'public' / 'sign-frames'
OUT = ROOT / 'annotations'
MANIFEST = ROOT / 'src' / 'data' / 'includeSignFrames.json'
LABEL_MAP = ROOT / 'models' / 'include' / 'label_map_include.json'


def compact(value):
    return re.sub(r'[^a-z0-9]', '', value.lower())


def box(points, width, height):
    xs = [p.x for p in points]
    ys = [p.y for p in points]
    left, right = max(0.0, min(xs)), min(1.0, max(xs))
    top, bottom = max(0.0, min(ys)), min(1.0, max(ys))
    return {
        'pixel': {
            'x': round(left * width, 2), 'y': round(top * height, 2),
            'width': round((right - left) * width, 2), 'height': round((bottom - top) * height, 2),
        },
        'normalized': {
            'x': round(left, 6), 'y': round(top, 6),
            'width': round(right - left, 6), 'height': round(bottom - top, 6),
        },
    }


def main():
    frame_map = json.loads(MANIFEST.read_text())
    label_map = json.loads(LABEL_MAP.read_text())
    ids = {compact(name): class_id for name, class_id in label_map.items()}
    annotations = []
    no_hand = []
    mp_hands = mp.solutions.hands
    with mp_hands.Hands(static_image_mode=True, max_num_hands=2, model_complexity=1,
                        min_detection_confidence=0.4) as hands:
        for sign, web_path in sorted(frame_map.items()):
            image_path = ROOT / 'public' / web_path.lstrip('/')
            image = cv2.imread(str(image_path))
            if image is None:
                continue
            height, width = image.shape[:2]
            compact_sign = compact(sign)
            class_id = ids.get(compact_sign)
            if class_id is None:
                aliases = [value for key, value in ids.items() if key.endswith(compact_sign)]
                class_id = aliases[0] if len(aliases) == 1 else None
            if class_id is None:
                raise RuntimeError(f'No INCLUDE class ID for {sign!r}')
            result = hands.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            records = []
            for hand_index, landmarks in enumerate(result.multi_hand_landmarks or []):
                points = landmarks.landmark
                hand_box = box(points, width, height)
                handedness = (result.multi_handedness[hand_index].classification[0]
                              if result.multi_handedness else None)
                records.append({
                    'index': hand_index,
                    'handedness': handedness.label if handedness else None,
                    'handedness_score': round(handedness.score, 6) if handedness else None,
                    **hand_box,
                    'landmarks': [
                        {
                            'index': i,
                            'x': round(point.x, 6), 'y': round(point.y, 6), 'z': round(point.z, 6),
                            'pixel_x': round(point.x * width, 2), 'pixel_y': round(point.y * height, 2),
                        }
                        for i, point in enumerate(points)
                    ],
                })
            if not records:
                no_hand.append(sign)
            annotations.append({
                'image': str(image_path.relative_to(ROOT)),
                'sign': sign,
                'class_id': class_id,
                'width': width,
                'height': height,
                'hands': records,
            })

    (OUT / 'include_landmarks.json').write_text(json.dumps(annotations, indent=2) + '\n')
    print(f'Annotated {len(annotations)} frames; {sum(bool(item["hands"]) for item in annotations)} with hands')
    print(f'No hand detected: {len(no_hand)}')
    if no_hand:
        print(', '.join(no_hand))


if __name__ == '__main__':
    main()
