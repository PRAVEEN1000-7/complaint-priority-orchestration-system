#!/bin/bash
set -e

echo "Starting build process..."

# Build the frontend
echo "Building Vite frontend..."
cd frontend
npm install
npm run build
cd ..

# Install backend requirements
echo "Installing backend requirements..."
pip install -r requirements.txt

echo "Build completed successfully!"
