# Vercel Frontend Deployment Script for Windows

Write-Host "🚀 Deploying Task Manager Frontend to Vercel (Free Tier)..." -ForegroundColor Green

# Install Vercel CLI if not installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Login to Vercel (if not already logged in)
Write-Host "Logging in to Vercel..." -ForegroundColor Yellow
vercel login

# Set environment variables for production
Write-Host "Setting environment variables..." -ForegroundColor Yellow
Write-Host "Please set the following environment variables in Vercel dashboard:" -ForegroundColor Cyan
Write-Host "- REACT_APP_API_URL=https://task-manager-backend-production.up.railway.app" -ForegroundColor White
Write-Host "- REACT_APP_BACKEND_URL=https://task-manager-backend-production.up.railway.app" -ForegroundColor White

# Deploy to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod

Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
Write-Host "🔗 Your frontend URL: https://task-manager-frontend.vercel.app" -ForegroundColor Cyan
Write-Host "📊 Free tier includes: 100GB bandwidth/month, unlimited projects" -ForegroundColor Yellow 