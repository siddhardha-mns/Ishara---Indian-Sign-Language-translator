# INCLUDE model

This directory contains the official AI4Bharat INCLUDE small Transformer checkpoint,
its 263-class label map, and the original repository license.

The checkpoint consumes 169 frames of 134 values per frame:

- 50 pose values (25 x/y points)
- 42 left-hand values (21 x/y points)
- 42 right-hand values (21 x/y points)

Run the optional inference service from the repository root:

```bash
pip install -r backend/requirements.txt
uvicorn backend.include_server:app --port 8000
```
