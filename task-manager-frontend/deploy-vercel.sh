#!/bin/bash

# Vercel Frontend Deployment Script (Free Tier)

echo "🚀 Deploying Task Manager Frontend to Vercel (Free Tier)..."

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
vercel login

# Set environment variables for production
echo "Setting environment variables..."
echo "Please set the following environment variables in Vercel dashboard:"
echo "- REACT_APP_API_URL=https://task-manager-backend-production.up.railway.app"
echo "- REACT_APP_BACKEND_URL=https://task-manager-backend-production.up.railway.app"

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployed successfully!"
echo "🔗 Your frontend URL: https://task-manager-frontend.vercel.app"
echo "📊 Free tier includes: 100GB bandwidth/month, unlimited projects" 