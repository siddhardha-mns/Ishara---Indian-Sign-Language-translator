"""Crop INCLUDE reference frames around the detected signing hands."""

import json
from pathlib import Path

import cv2

ROOT = Path(__file__).resolve().parents[1]
ANNOTATIONS = ROOT / 'annotations' / 'include_landmarks.json'


def main():
    records = json.loads(ANNOTATIONS.read_text())
    enhanced = 0
    for record in records:
        image_path = ROOT / record['image']
        image = cv2.imread(str(image_path))
        hands = record['hands']
        if image is None or not hands:
            continue
        height, width = image.shape[:2]
        left = min(hand['pixel']['x'] for hand in hands)
        top = min(hand['pixel']['y'] for hand in hands)
        right = max(hand['pixel']['x'] + hand['pixel']['width'] for hand in hands)
        bottom = max(hand['pixel']['y'] + hand['pixel']['height'] for hand in hands)
        hand_width = max(1.0, right - left)
        hand_height = max(1.0, bottom - top)
        crop_width = min(width, max(width * 0.48, hand_width * 3.2, hand_height * 2.4))
        crop_height = min(height, crop_width * 0.75)
        center_x = (left + right) / 2
        center_y = (top + bottom) / 2 + hand_height * 0.15
        x0 = max(0, min(width - crop_width, center_x - crop_width / 2))
        y0 = max(0, min(height - crop_height, center_y - crop_height / 2))
        crop = image[int(y0):int(y0 + crop_height), int(x0):int(x0 + crop_width)]
        if crop.size:
            cv2.imwrite(str(image_path), crop, [cv2.IMWRITE_JPEG_QUALITY, 88])
            enhanced += 1
    print(f'Enhanced {enhanced} hand-visible reference frames')


if __name__ == '__main__':
    main()
