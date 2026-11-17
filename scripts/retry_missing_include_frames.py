import tempfile
from pathlib import Path
from zipfile import ZipFile

import cv2
import requests

from extract_include_frames import OUT, RECORD, RangeReader, rows, slug


def main():
    manifest = requests.get(RECORD, timeout=60).json()['files']
    archives = {item['key']: item['links']['self'] for item in manifest if item['key'].endswith('.zip')}
    wanted = {'Bird', 'Second (Number)'}
    selected = {
        row['label'].split('.', 1)[-1].strip(): row
        for row in rows()
        if row['label'].split('.', 1)[-1].strip() in wanted
    }
    for name, row in selected.items():
        video_bytes = None
        category = row['parent_label'].replace(' ', '_')
        for archive in sorted(key for key in archives if key.startswith(category + '_')):
            print(f'{name}: checking {archive}', flush=True)
            with ZipFile(RangeReader(archives[archive])) as archive_file:
                if name == 'Second (Number)':
                    matches = [entry for entry in archive_file.infolist() if entry.filename.startswith('Days_and_Time/81. Second/') and not entry.is_dir()]
                else:
                    matches = [entry for entry in archive_file.infolist() if entry.filename.endswith(row['video_path'])]
                if matches:
                    video_bytes = archive_file.read(matches[0])
                    break
        if not video_bytes:
            raise RuntimeError(f'Video not found for {name}')
        target = OUT / f'{slug(name)}.jpg'
        with tempfile.NamedTemporaryFile(suffix='.mp4') as video_file:
            video_file.write(video_bytes)
            video_file.flush()
            capture = cv2.VideoCapture(video_file.name)
            count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
            capture.set(cv2.CAP_PROP_POS_FRAMES, max(0, count // 2))
            ok, frame = capture.read()
            capture.release()
        if not ok:
            raise RuntimeError(f'Could not decode {name}')
        if frame.shape[1] > 640:
            frame = cv2.resize(frame, (640, round(frame.shape[0] * 640 / frame.shape[1])), interpolation=cv2.INTER_AREA)
        if not cv2.imwrite(str(target), frame, [cv2.IMWRITE_JPEG_QUALITY, 82]):
            raise RuntimeError(f'Could not write {target}')
        print(f'Wrote {target}', flush=True)


if __name__ == '__main__':
    main()
