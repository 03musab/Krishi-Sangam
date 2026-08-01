@echo off
title Krishi Sangam Launcher
echo.
echo ============================================
echo    🌾 Krishi Sangam — Starting Application
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

:: Check if server node_modules exist
if not exist "server\node_modules" (
    echo [INFO] Installing server dependencies...
    cd server
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    cd ..
)

:: Check if client node_modules exist
if not exist "client\node_modules" (
    echo [INFO] Installing client dependencies...
    cd client
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    cd ..
)

echo [INFO] Starting the Krishi Sangam API server...
echo [INFO] Starting the React frontend...
echo [INFO] The app will open automatically in your browser.
echo.

:: Start the API server in a new window
start "Krishi Sangam Server" cmd /c "cd /d "%~dp0server" && npm start"

:: Start the React dev server in a new window
start "Krishi Sangam Frontend" cmd /c "cd /d "%~dp0client" && npm run dev"

:: Wait for the API server to be ready (poll health endpoint)
echo [INFO] Waiting for server to start...
setlocal enabledelayedexpansion
for /l %%i in (1,1,20) do (
    timeout /t 1 /nobreak >nul
    >nul 2>&1 curl -s http://localhost:3001/api/health && goto server_ready
)
echo [WARN] Server health check timed out, opening browser anyway...
:server_ready
endlocal

:: Open the browser
echo [INFO] Opening http://localhost:5173 in your browser...
start http://localhost:5173

echo.
echo ============================================
echo    ✅ Krishi Sangam is running!
echo    📍 App:    http://localhost:5173
echo    📍 API:    http://localhost:3001/api/health
echo.
echo    Close this window to stop?
echo    No — just close the server windows separately.
echo ============================================
echo.
pause
