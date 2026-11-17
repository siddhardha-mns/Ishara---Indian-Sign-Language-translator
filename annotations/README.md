# INCLUDE frame annotations

`include_landmarks.json` contains one record per representative frame. Each detected hand includes:

- `handedness` and `handedness_score`
- `pixel` and `normalized` bounding boxes
- 21 landmarks, each with normalized `x/y/z` and pixel `pixel_x/pixel_y`

An item with an empty `hands` array means MediaPipe did not detect a hand in that representative frame.
