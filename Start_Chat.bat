@echo off
cd /d "%~dp0"
call npm install
call npm run chat
pause
