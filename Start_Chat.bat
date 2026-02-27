@echo off
title Newbot - Chat
cd /d "%~dp0"
echo.
echo  ============================================
echo          NEWBOT (Windows)
echo  ============================================
echo.
echo  Starting... 
echo  (First run will download ~2.2 GB model — be patient!)
echo.
call npm install --silent
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Could not install dependencies.
    echo  Run Setup.bat first, then try again.
    pause
    exit /b 1
)
call npm run chat
echo.
pause
