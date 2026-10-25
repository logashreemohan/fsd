from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
from services.image_analyzer import ImageAnalyzer
from services.video_analyzer import VideoAnalyzer

router = APIRouter()
image_analyzer = ImageAnalyzer()
video_analyzer = VideoAnalyzer()

@router.post("/image")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # Save temp file
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        # Analyze
        result = image_analyzer.analyze(file_location)
        
        # Cleanup
        os.remove(file_location)
        
        return result
    except Exception as e:
        if os.path.exists(file_location):
            os.remove(file_location)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/video")
async def analyze_video(file: UploadFile = File(...)):
    try:
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        result = video_analyzer.analyze(file_location)
        
        os.remove(file_location)
        
        return result
    except Exception as e:
        if os.path.exists(file_location):
            os.remove(file_location)
        raise HTTPException(status_code=500, detail=str(e))
