@echo off
cd /d "%~dp0"

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
  echo Stopping old backend PID %%a...
  taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

if exist ".venv311\Scripts\python.exe" (
  .venv311\Scripts\python.exe -c "import sqlalchemy" 2>nul
  if errorlevel 1 (
    echo Installing CMS dependencies ^(sqlalchemy, pymysql^)...
    .venv311\Scripts\pip.exe install sqlalchemy pymysql cryptography email-validator -q
  )
)

echo Starting backend on http://localhost:8000 ...
python main.py
pause
