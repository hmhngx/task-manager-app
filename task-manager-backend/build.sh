#!/bin/bash

# Build script for NestJS application

echo "Starting build process..."

# Clean previous build
echo "Cleaning previous build..."
rm -rf dist

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Check if build was successful
if [ -f "dist/main.js" ]; then
    echo "✅ Build successful! dist/main.js exists."
    ls -la dist/
else
    echo "❌ Build failed! dist/main.js not found."
    echo "Contents of dist directory:"
    ls -la dist/ || echo "dist directory does not exist"
    exit 1
fi

echo "Build process completed!" 