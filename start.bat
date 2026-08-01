@echo off
title KrishiSetu Launcher
echo.
echo ============================================
echo    🌾 KrishiSetu — Starting Application
echo ============================================
echo.

:: Navigate to the script's directory (project root)
cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exist
if not exist "server\node_modules" (
    echo [INFO] Installing dependencies...
    cd server
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    cd ..
)

echo [INFO] Starting the KrishiSetu API server...
echo [INFO] The app will open automatically in your browser.
echo.

:: Start the server in a new window
start "KrishiSetu Server" cmd /c "cd /d "%~dp0server" && npm start"

:: Wait for the server to be ready (poll health endpoint)
echo [INFO] Waiting for server to start...
setlocal enabledelayedexpansion
for /l %%i in (1,1,15) do (
    timeout /t 1 /nobreak >nul
    >nul 2>&1 curl -s http://localhost:3001/api/health && goto server_ready
)
echo [WARN] Server health check timed out, opening browser anyway...
:server_ready
endlocal

:: Open the browser
echo [INFO] Opening http://localhost:3001 in your browser...
start http://localhost:3001

echo.
echo ============================================
echo    ✅ KrishiSetu is running!
echo    📍 App:    http://localhost:3001
echo    📍 Health: http://localhost:3001/api/health
echo.
echo    Close this window to stop? 
echo    No — just close the server window separately.
echo ============================================
echo.
pause
