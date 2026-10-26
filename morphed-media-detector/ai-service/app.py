from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import detection
import os

app = FastAPI(title="AI Media Detection Service")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detection.router, prefix="/api/detection", tags=["Detection"])

@app.get("/")
def read_root():
    return {"message": "AI Media Detection Service is running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", os.environ.get("AI_SERVICE_PORT", 8000)))
    uvicorn.run(app, host="0.0.0.0", port=port)
