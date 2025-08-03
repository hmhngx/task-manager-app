#!/bin/bash

# Start script for NestJS application

echo "Starting NestJS application..."

# Check if dist/main.js exists
if [ ! -f "dist/main.js" ]; then
    echo "❌ dist/main.js not found! Building application..."
    npm run build
    
    # Check again after build
    if [ ! -f "dist/main.js" ]; then
        echo "❌ Build failed! dist/main.js still not found."
        echo "Contents of current directory:"
        ls -la
        echo "Contents of dist directory (if exists):"
        ls -la dist/ || echo "dist directory does not exist"
        exit 1
    fi
fi

echo "✅ Starting application with: node dist/main.js"
node dist/main.js 