#!/bin/bash
cd "$(dirname "$0")"
npm install
npm run setup
echo "Press any key to close..."
read -n 1
