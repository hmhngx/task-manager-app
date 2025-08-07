# Vercel Deployment Script for Windows
# This script deploys the frontend to Vercel with the correct backend URL

Write-Host "🚀 Deploying TaskFlow Frontend to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Set environment variables for the deployment
Write-Host "🔧 Setting environment variables..." -ForegroundColor Yellow

# Set the backend URL to the deployed Railway backend
$env:REACT_APP_API_URL = "https://task-flow-production-71a7.up.railway.app"
$env:REACT_APP_BACKEND_URL = "https://task-flow-production-71a7.up.railway.app"
$env:REACT_APP_ENV = "production"

Write-Host "✅ Environment variables set:" -ForegroundColor Green
Write-Host "   REACT_APP_API_URL: $env:REACT_APP_API_URL" -ForegroundColor Cyan
Write-Host "   REACT_APP_BACKEND_URL: $env:REACT_APP_BACKEND_URL" -ForegroundColor Cyan
Write-Host "   REACT_APP_ENV: $env:REACT_APP_ENV" -ForegroundColor Cyan

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your frontend should now be connected to the deployed backend" -ForegroundColor Green 