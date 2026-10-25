import cv2
import numpy as np
from services.face_detector import FaceDetector
from models.deepfake_detector import DeepfakeDetector

class ImageAnalyzer:
    def __init__(self):
        self.face_detector = FaceDetector()
        self.deepfake_detector = DeepfakeDetector()

    def analyze(self, image_path: str):
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Could not read image file.")

        # Detect faces
        faces = self.face_detector.detect_faces(image)

        if not faces:
            return {
                "faces_detected": 0,
                "confidence": 0,
                "real_probability": 0,
                "manipulation_probability": 0,
                "label": "UNKNOWN",
                "explanation": "No faces detected in the image.",
                "faces": []
            }

        highest_manipulation_prob = 0
        overall_label = "REAL"
        overall_explanation = "Faces appear natural."
        real_prob = 1.0

        for face in faces:
            x, y, w, h = face["x"], face["y"], face["width"], face["height"]
            
            # Crop face
            face_crop = image[y:y+h, x:x+w]
            
            if face_crop.size == 0:
                continue
                
            # Predict
            result = self.deepfake_detector.predict(face_crop)
            
            face["real_probability"] = result["real_probability"]
            face["manipulation_probability"] = result["manipulation_probability"]
            face["label"] = result["label"]
            face["explanation"] = result["explanation"]
            
            # Aggregate overall score (take the most suspicious face as the overall result)
            if result["manipulation_probability"] > highest_manipulation_prob:
                highest_manipulation_prob = result["manipulation_probability"]
                real_prob = result["real_probability"]
                overall_label = result["label"]
                overall_explanation = result["explanation"]

        return {
            "faces_detected": len(faces),
            "confidence": round(max(real_prob, highest_manipulation_prob) * 100, 2),
            "real_probability": real_prob,
            "manipulation_probability": highest_manipulation_prob,
            "label": overall_label,
            "explanation": overall_explanation,
            "faces": faces
        }
