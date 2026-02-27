@echo off
title Newbot Setup
cd /d "%~dp0"
echo.
echo  ============================================
echo          NEWBOT - SETUP (Windows)
echo  ============================================
echo.
echo  This will install all dependencies.
echo  On first chat, the model (~2.2 GB) will be
echo  downloaded automatically from Hugging Face.
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] npm install failed. Is Node.js installed?
    echo  Download it from: https://nodejs.org
    pause
    exit /b 1
)
echo.
echo  ============================================
echo   Setup complete! Run Start_Chat.bat to chat.
echo  ============================================
echo.
pause
