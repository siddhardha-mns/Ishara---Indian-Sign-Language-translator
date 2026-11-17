"""Evaluate saved INCLUDE landmark sequences.

Each JSON file in --data-dir must contain {"label": "class-name", "sequence": [[...], ...]}.
The sequence must have 134 values per frame; the evaluator uses the latest 169 frames.
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import torch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from backend.include_server import DEVICE, LABELS, MODEL


def predict(sequence):
    values = np.asarray(sequence, dtype=np.float32)
    if values.ndim != 2 or values.shape[1] != 134 or len(values) < 1:
        raise ValueError('sequence must have shape [frames, 134]')
    values = values[-169:]
    padded = np.pad(values, ((0, 169 - len(values)), (0, 0)))
    with torch.no_grad():
        probabilities = torch.softmax(MODEL(torch.from_numpy(padded).unsqueeze(0).to(DEVICE))[0], dim=-1)
        scores, indices = torch.topk(probabilities, k=5)
    return [(LABELS[int(index)], float(score)) for score, index in zip(scores, indices)]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', type=Path)
    parser.add_argument('--smoke-test', action='store_true')
    args = parser.parse_args()
    if args.smoke_test:
        result = predict(np.zeros((32, 134), dtype=np.float32))
        print(json.dumps({'status': 'ok', 'top5': result}))
        return
    if not args.data_dir:
        parser.error('--data-dir is required unless --smoke-test is used')

    samples = []
    for path in sorted(args.data_dir.glob('*.json')):
        sample = json.loads(path.read_text())
        samples.append((sample['label'], predict(sample['sequence'])))
    if not samples:
        raise SystemExit(f'No JSON samples found in {args.data_dir}')

    top1 = sum(label == predictions[0][0] for label, predictions in samples)
    top5 = sum(label in {name for name, _ in predictions} for label, predictions in samples)
    print(json.dumps({
        'samples': len(samples),
        'top1_accuracy': round(top1 / len(samples), 4),
        'top5_accuracy': round(top5 / len(samples), 4),
        'correct_top1': top1,
        'correct_top5': top5,
    }, indent=2))


if __name__ == '__main__':
    main()
