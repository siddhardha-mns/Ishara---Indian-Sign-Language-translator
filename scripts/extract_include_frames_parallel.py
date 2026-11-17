from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import re
import tempfile
from pathlib import Path
from zipfile import ZipFile

import cv2
import requests

from extract_include_frames import OUT, RECORD, RangeReader, rows, slug


def extract(item, archives):
    index, label, row = item
    name = label.split('.', 1)[-1].strip()
    target = OUT / f'{slug(name)}.jpg'
    if target.exists():
        return index, name, f'/sign-frames/{target.name}'

    category = row['parent_label'].replace(' ', '_')
    video_bytes = None
    for archive in [key for key in archives if key.startswith(category + '_')]:
        with ZipFile(RangeReader(archives[archive])) as archive_file:
            matches = [entry for entry in archive_file.infolist() if entry.filename.endswith(row['video_path'])]
            if matches:
                video_bytes = archive_file.read(matches[0])
                break
    if video_bytes is None:
        return index, name, None

    with tempfile.NamedTemporaryFile(suffix='.mp4') as video_file:
        video_file.write(video_bytes)
        video_file.flush()
        capture = cv2.VideoCapture(video_file.name)
        frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
        capture.set(cv2.CAP_PROP_POS_FRAMES, max(0, frame_count // 2))
        ok, frame = capture.read()
        capture.release()
    if not ok:
        return index, name, None
    height, width = frame.shape[:2]
    if width > 640:
        frame = cv2.resize(frame, (640, round(height * 640 / width)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(str(target), frame, [cv2.IMWRITE_JPEG_QUALITY, 82])
    return index, name, f'/sign-frames/{target.name}'


def main():
    manifest = requests.get(RECORD, timeout=60).json()['files']
    archives = {item['key']: item['links']['self'] for item in manifest if item['key'].endswith('.zip')}
    selected = {}
    for row in rows():
        selected.setdefault(row['label'], row)
    items = [(index, label, row) for index, (label, row) in enumerate(sorted(selected.items()), 1)]
    output = {
        path.stem.replace('-', ' '): f'/sign-frames/{path.name}'
        for path in OUT.glob('*.jpg')
    }
    manifest_path = Path(__file__).resolve().parents[1] / 'src/data/includeSignFrames.json'
    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(extract, item, archives) for item in items]
        for future in as_completed(futures):
            try:
                index, name, path = future.result()
            except Exception as error:
                index, name, path = -1, 'unknown', None
                print(f'Extraction failed: {error}', flush=True)
            if path:
                output[name] = path
                manifest_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
            print(f'[{index}/263] {name}', flush=True)
    (Path(__file__).resolve().parents[1] / 'src/data/includeSignFrames.json').write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8'
    )
    print(f'Wrote {len(output)} representative frames', flush=True)


if __name__ == '__main__':
    main()
