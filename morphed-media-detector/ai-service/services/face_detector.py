import cv2
import numpy as np
import os

class FaceDetector:
    def __init__(self):
        # We use OpenCV's built-in Haar Cascade classifier to avoid MediaPipe dependency issues.
        # This provides a robust and simple face detection baseline.
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)

    def detect_faces(self, image: np.ndarray):
        """
        Detects faces in an image using OpenCV.
        Returns a list of bounding boxes: [{"x": int, "y": int, "width": int, "height": int, "confidence": float}]
        """
        # Convert to grayscale for Haar Cascade
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        # scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
        faces_rects = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(30, 30)
        )

        faces = []
        for (x, y, w, h) in faces_rects:
            # Haar cascades don't provide a confidence score out-of-the-box in the same way DNNs do,
            # so we'll assign a baseline confidence. 
            # (cv2.CascadeClassifier can return weights if outputRejectLevels=True, but this is simpler).
            
            # Ensure coordinates are within image boundaries (detectMultiScale usually guarantees this, but to be safe)
            img_h, img_w = image.shape[:2]
            x = max(0, x)
            y = max(0, y)
            w = min(w, img_w - x)
            h = min(h, img_h - y)

            faces.append({
                "x": int(x),
                "y": int(y),
                "width": int(w),
                "height": int(h),
                "confidence": 0.95  # Static placeholder since Haar is binary (detected or not)
            })
            
        return faces
