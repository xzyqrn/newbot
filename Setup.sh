#!/bin/bash
# Setup.sh — Linux setup script for Newbot

cd "$(dirname "$0")"

echo ""
echo " ============================================"
echo "         NEWBOT - SETUP (Linux)"
echo " ============================================"
echo ""
echo " This will install all dependencies."
echo " On first chat, the model (~2.2 GB) will be"
echo " downloaded automatically from Hugging Face."
echo ""

npm install
if [ $? -ne 0 ]; then
  echo ""
  echo " [ERROR] npm install failed. Is Node.js installed?"
  echo " Install with: sudo apt install nodejs npm"
  echo "   or visit: https://nodejs.org"
  echo ""
  exit 1
fi

echo ""
echo " ============================================"
echo "  Setup complete! Run ./Start_Chat.sh"
echo "  to begin chatting."
echo " ============================================"
echo ""
