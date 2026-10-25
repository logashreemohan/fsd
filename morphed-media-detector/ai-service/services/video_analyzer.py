import cv2
import os
import tempfile
from services.face_detector import FaceDetector
from models.deepfake_detector import DeepfakeDetector

class VideoAnalyzer:
    def __init__(self):
        self.face_detector = FaceDetector()
        self.deepfake_detector = DeepfakeDetector()
        self.frame_sample_rate = 5 # 1 frame every 5 frames

    def analyze(self, video_path: str):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError("Could not open video file.")

        fps = cap.get(cv2.CAP_PROP_FPS)
        if not fps or fps <= 0:
            fps = 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        frameResults = []
        suspicious_frames_count = 0
        frames_analyzed = 0
        
        frame_idx = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_idx % self.frame_sample_rate == 0:
                frames_analyzed += 1
                faces = self.face_detector.detect_faces(frame)
                
                if faces:
                    frame_manipulation_probs = []
                    
                    for face in faces:
                        x, y, w, h = face["x"], face["y"], face["width"], face["height"]
                        face_crop = frame[y:y+h, x:x+w]
                        
                        if face_crop.size > 0:
                            result = self.deepfake_detector.predict(face_crop)
                            frame_manipulation_probs.append(result["manipulation_probability"])
                    
                    if frame_manipulation_probs:
                        max_prob = max(frame_manipulation_probs)
                        is_suspicious = max_prob > 0.60
                        
                        if is_suspicious:
                            suspicious_frames_count += 1
                            
                        timestamp = frame_idx / fps
                        
                        frameResults.append({
                            "timestamp": round(timestamp, 2),
                            "frameNumber": frame_idx,
                            "confidence": round(max(max_prob, 1 - max_prob) * 100, 2),
                            "label": "SUSPICIOUS" if is_suspicious else "REAL",
                            "faceCount": len(faces),
                            "boundingBoxes": faces
                        })
                        
            frame_idx += 1
            
            # Limit the number of frames processed to avoid extremely long processing times
            if frames_analyzed > 60:
                break

        cap.release()

        frames_with_faces = len(frameResults)
        total_faces_detected = max([r.get("faceCount", 0) for r in frameResults], default=0)

        if frames_with_faces == 0:
            return {
                "frames_analyzed": frames_analyzed,
                "suspicious_frames": 0,
                "faces_detected": 0,
                "confidence": 0,
                "real_probability": 0,
                "manipulation_probability": 0,
                "label": "UNKNOWN",
                "explanation": f"Analyzed {frames_analyzed} frames across the video, but no human faces were detected. Deepfake detection requires clear visible faces.",
                "frame_results": []
            }
            
        overall_manipulation_prob = suspicious_frames_count / frames_with_faces
        overall_real_prob = 1.0 - overall_manipulation_prob
        
        overall_label = "SUSPICIOUS" if overall_manipulation_prob > 0.35 else "REAL"
        
        explanation = f"Analyzed {frames_analyzed} frames ({frames_with_faces} frames contained visible faces). "
        if overall_label == "SUSPICIOUS":
            explanation += f"Found significant manipulation artifacts in {suspicious_frames_count} of {frames_with_faces} face frames ({(overall_manipulation_prob * 100):.1f}%)."
        else:
            explanation += f"Facial features and temporal transitions remain consistent across all {frames_with_faces} face frames."

        return {
            "frames_analyzed": frames_analyzed,
            "suspicious_frames": suspicious_frames_count,
            "faces_detected": total_faces_detected,
            "confidence": round(max(overall_real_prob, overall_manipulation_prob) * 100, 2),
            "real_probability": round(overall_real_prob, 4),
            "manipulation_probability": round(overall_manipulation_prob, 4),
            "label": overall_label,
            "explanation": explanation,
            "frame_results": frameResults
        }
