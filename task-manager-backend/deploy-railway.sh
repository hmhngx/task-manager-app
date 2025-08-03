#!/bin/bash

# Railway Backend Deployment Script

echo "🚀 Deploying Task Manager Backend to Railway..."

# Install Railway CLI if not installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
railway login

# Link to Railway project (create if doesn't exist)
railway link

# Set environment variables
echo "Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3000

# Deploy to Railway
echo "Deploying to Railway..."
railway up

echo "✅ Backend deployed successfully!"
echo "🔗 Your backend URL: https://your-app-name.railway.app" 