"""Extract one representative INCLUDE frame per label using HTTP range requests.

Only ZIP central directories and the selected compressed video entries are fetched;
the large Zenodo archives are never downloaded in full.
"""

import json
import os
import re
import tempfile
import time
from pathlib import Path
from urllib.parse import quote
from zipfile import ZipFile

import cv2
import pandas as pd
import requests
from huggingface_hub import hf_hub_download

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "sign-frames"
OUT.mkdir(parents=True, exist_ok=True)
RECORD = "https://zenodo.org/api/records/4010759"
DATASET_API = "https://datasets-server.huggingface.co/rows?dataset=ai4bharat/INCLUDE&config=default&split={split}&offset={offset}&length=100"


class RangeReader:
    def __init__(self, url: str):
        self.url = url
        self.position = 0
        self.session = requests.Session()
        response = self._get({"Range": "bytes=0-0"}, 60)
        match = re.search(r"/([0-9]+)$", response.headers.get("Content-Range", ""))
        if not match:
            raise RuntimeError(f"Range requests unavailable for {url}")
        self.size = int(match.group(1))
    def seekable(self):
        return True

    def seek(self, offset, whence=0):
        if whence == 0:
            self.position = offset
        elif whence == 1:
            self.position += offset
        elif whence == 2:
            self.position = self.size + offset
        return self.position

    def tell(self):
        return self.position

    def read(self, size=-1):
        if size < 0:
            size = self.size - self.position
        if size == 0 or self.position >= self.size:
            return b""
        end = min(self.size - 1, self.position + size - 1)
        response = self._get({"Range": f"bytes={self.position}-{end}"}, 120)
        data = response.content
        self.position += len(data)
        return data

    def _get(self, headers, timeout):
        for attempt in range(6):
            response = self.session.get(self.url, headers=headers, timeout=timeout)
            if response.status_code != 429 and response.status_code < 500:
                response.raise_for_status()
                return response
            delay = min(60, int(response.headers.get("Retry-After", "30")))
            time.sleep(delay * (attempt + 1))
        response.raise_for_status()
        return response


def rows():
    output = []
    for split in ("train", "val", "test"):
        parquet = hf_hub_download(
            repo_id="ai4bharat/INCLUDE",
            repo_type="dataset",
            filename=f"data/{split}-00000-of-00001.parquet",
        )
        for row in pd.read_parquet(parquet).to_dict("records"):
            output.append(row)
    return output


def slug(label: str):
    return re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")


def main():
    manifest = requests.get(RECORD, timeout=60).json()["files"]
    archives = {
        item["key"]: item["links"]["self"]
        for item in manifest
        if item["key"].endswith(".zip")
    }
    selected = {}
    for row in rows():
        selected.setdefault(row["label"], row)

    output_map = {}
    for index, (label, row) in enumerate(sorted(selected.items()), 1):
        name = label.split(".", 1)[-1].strip()
        target = OUT / f"{slug(name)}.jpg"
        if target.exists():
            output_map[name] = f"/sign-frames/{target.name}"
            continue

        category = row["parent_label"].replace(" ", "_")
        candidates = [key for key in archives if key.startswith(category + "_")]
        if not candidates:
            print(f"[{index}/263] no archive for {label}")
            continue

        video_bytes = None
        for archive in candidates:
            reader = RangeReader(archives[archive])
            with ZipFile(reader) as archive_file:
                matches = [item for item in archive_file.infolist() if item.filename.endswith(row["video_path"])]
                if matches:
                    video_bytes = archive_file.read(matches[0])
                    break
        if video_bytes is None:
            print(f"[{index}/263] video not found for {label}")
            continue

        with tempfile.NamedTemporaryFile(suffix=".mp4") as video_file:
            video_file.write(video_bytes)
            video_file.flush()
            capture = cv2.VideoCapture(video_file.name)
            frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
            capture.set(cv2.CAP_PROP_POS_FRAMES, max(0, frame_count // 2))
            ok, frame = capture.read()
            capture.release()
            if not ok:
                print(f"[{index}/263] could not decode {label}")
                continue
            height, width = frame.shape[:2]
            if width > 640:
                frame = cv2.resize(frame, (640, round(height * 640 / width)), interpolation=cv2.INTER_AREA)
            cv2.imwrite(str(target), frame, [cv2.IMWRITE_JPEG_QUALITY, 82])

        output_map[name] = f"/sign-frames/{target.name}"
        print(f"[{index}/263] {name}", flush=True)

    (ROOT / "src" / "data" / "includeSignFrames.json").write_text(
        json.dumps(output_map, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(output_map)} representative frames")


if __name__ == "__main__":
    main()
