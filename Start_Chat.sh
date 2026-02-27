#!/bin/bash
# Start_Chat.sh — Linux chat launcher for Newbot

cd "$(dirname "$0")"

echo ""
echo " ============================================"
echo "         NEWBOT (Linux)"
echo " ============================================"
echo ""
echo " Starting..."
echo " (First run will download ~2.2 GB model — be patient!)"
echo ""

npm install --silent
if [ $? -ne 0 ]; then
  echo ""
  echo " [ERROR] Could not install dependencies."
  echo " Run ./Setup.sh first, then try again."
  echo ""
  exit 1
fi

npm run chat
