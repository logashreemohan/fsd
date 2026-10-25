# Morphed Media Detection System

A complete full-stack web application built with the MERN stack and a Python FastAPI AI service for detecting AI-morphed, face-swapped, manipulated, or deepfake faces in images and videos.

## Features
- **Image Analysis**: Detect face-swaps and manipulation in images.
- **Video Analysis**: Frame-by-frame temporal analysis for video deepfakes.
- **User Dashboard**: Keep track of history and results.
- **Visual Analytics**: Interactive charts showing detection statistics.
- **Explainable AI Indicators**: Insights into why media was flagged.

## Architecture
```
React (Frontend) → Node/Express (Backend) → Python FastAPI (AI Service)
                        ↓
                     MongoDB
```

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React
- **Backend**: Node.js, Express, MongoDB, Mongoose, Multer, node-fetch
- **AI Service**: Python, FastAPI, OpenCV, MediaPipe

## Prerequisites
- Node.js (v16+)
- Python (3.9+)
- MongoDB

## Installation

### 1. Database
Make sure MongoDB is running locally on port `27017`, or update the `MONGO_URI` in `.env`.

### 2. Python AI Service
```bash
cd ai-service
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate
pip install -r requirements.txt
python app.py
```
Service runs on `http://localhost:8000`

### 3. Node Backend
```bash
cd server
npm install
# Rename .env.example to .env
npm run dev
```
Server runs on `http://localhost:5000`

### 4. React Frontend
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`

## Docker Setup
You can also run the entire application using Docker Compose. Ensure you have Dockerfiles set up in each directory (not included by default) and run:
```bash
docker-compose up --build
```

## Important Note regarding AI Detection
The AI Service currently includes a **baseline/heuristic implementation** for demonstration purposes. It does not use a fully trained deepfake model (which would require downloading gigabytes of pre-trained weights). The architecture is specifically designed to allow a real PyTorch/ONNX model to be plugged into `ai-service/models/deepfake_detector.py`. 

Results are probabilistic and should **never** be treated as definitive proof of manipulation.
