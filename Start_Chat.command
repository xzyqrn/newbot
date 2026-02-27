#!/bin/bash
cd "$(dirname "$0")"
npm install
npm run chat
echo "Press any key to close..."
read -n 1
