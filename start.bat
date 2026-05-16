@echo off
echo [1/3] Frontend build ediliyor...
cd /d C:\Users\hayru\dermapanel
call npm run build
if errorlevel 1 (
    echo HATA: Frontend build basarisiz!
    pause
    exit /b 1
)

echo [2/3] Bagimliliklar yukleniyor...
cd /d C:\Users\hayru\dermapanel-backend
pip install -r requirements.txt -q

echo [3/3] Sunucu baslatiliyor...
echo.
echo  DermaPanel: http://localhost:8000
echo.
uvicorn main:app --host 0.0.0.0 --port 8000
