import sys
import json
import cv2

# OPTIONAL: uncomment when you have model
# from ultralytics import YOLO

def run_yolo_inference(image_path):
    img = cv2.imread(image_path)

    if img is None:
        raise Exception("Invalid image path")

    h, w, _ = img.shape

    # =========================
    # 🔥 REAL YOLO (ENABLE LATER)
    # =========================
    # model = YOLO("models/best.pt")
    # results = model(img)
    #
    # detections = []
    # for r in results:
    #     for box in r.boxes:
    #         x1, y1, x2, y2 = box.xyxy[0].tolist()
    #         conf = float(box.conf[0])
    #
    #         detections.append({
    #             "x": int(x1),
    #             "y": int(y1),
    #             "w": int(x2 - x1),
    #             "h": int(y2 - y1),
    #             "confidence": conf
    #         })
    #
    # return detections

    # =========================
    # 🧪 MOCK (WORKING NOW)
    # =========================
    mock_boxes = [
        {"x": int(w * 0.3), "y": int(h * 0.4), "w": 25, "h": 25, "confidence": 0.95},
        {"x": int(w * 0.5), "y": int(h * 0.6), "w": 30, "h": 30, "confidence": 0.88},
        {"x": int(w * 0.7), "y": int(h * 0.45), "w": 20, "h": 20, "confidence": 0.91},
        {"x": int(w * 0.4), "y": int(h * 0.75), "w": 15, "h": 15, "confidence": 0.82}
    ]

    return mock_boxes


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]

    try:
        result = run_yolo_inference(image_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)