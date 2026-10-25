@echo off
echo ===================================================
echo Starting Morphed Media Detection System...
echo ===================================================

echo Checking MongoDB on port 27017...
netstat -ano | findstr ":27017" >nul
if errorlevel 1 (
    echo Starting MongoDB instance...
    if not exist "data\db" mkdir "data\db"
    start "MongoDB Server" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath data\db --port 27017
)

echo Starting Python AI Service...
start cmd /k "cd ai-service && .\venv\Scripts\activate && python app.py"

echo Starting Node.js Backend...
start cmd /k "cd server && npm run dev"

echo Starting React Frontend...
start cmd /k "cd client && npm run dev"

echo ===================================================
echo All services are starting in separate windows!
echo Frontend will be available at http://localhost:5173
echo Node Backend on http://localhost:5000
echo Python AI Service on http://localhost:8000
echo ===================================================
pause
