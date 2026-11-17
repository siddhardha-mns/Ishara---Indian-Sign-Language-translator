import json
import os

import numpy as np
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.model import Transformer, TransformerConfig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(ROOT, "models", "include", "include_no_cnn_transformer_small.pth")
LABEL_PATH = os.path.join(ROOT, "models", "include", "label_map_include.json")

with open(LABEL_PATH, "r", encoding="utf-8") as file:
    LABELS = {int(value): key for key, value in json.load(file).items()}

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL = Transformer(TransformerConfig(size="small", max_position_embeddings=256), n_classes=263)
MODEL.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE)["model"])
MODEL.to(DEVICE).eval()

app = FastAPI(title="Ishara INCLUDE inference")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    sequence: list[list[float]] = Field(min_length=32)


@app.get("/health")
def health():
    return {"status": "ok", "model": "INCLUDE", "classes": len(LABELS), "device": str(DEVICE)}


@app.post("/api/include/predict")
def predict(request: PredictionRequest):
    sequence = np.asarray(request.sequence, dtype=np.float32)
    if sequence.ndim != 2 or sequence.shape[1] != 134:
        raise HTTPException(status_code=400, detail="sequence must have shape [frames, 134]")

    sequence = sequence[-169:]
    padded = np.pad(sequence, ((0, 169 - len(sequence)), (0, 0)))
    with torch.no_grad():
        logits = MODEL(torch.from_numpy(padded).unsqueeze(0).to(DEVICE))[0]
        probabilities = torch.softmax(logits, dim=-1)
        confidence, index = probabilities.max(dim=-1)

    return {
        "label": LABELS[int(index)],
        "confidence": round(float(confidence), 4),
    }
