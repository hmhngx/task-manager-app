# Update Vercel Environment Variables Script
# This script updates the Vercel deployment with the correct backend URL

Write-Host "🔧 Updating Vercel Environment Variables..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Set the environment variables in Vercel
Write-Host "📝 Setting environment variables in Vercel..." -ForegroundColor Yellow

# Update REACT_APP_API_URL
Write-Host "Setting REACT_APP_API_URL..." -ForegroundColor Cyan
vercel env add REACT_APP_API_URL production
Write-Host "Enter the value when prompted: https://task-flow-production-71a7.up.railway.app" -ForegroundColor Yellow

# Update REACT_APP_BACKEND_URL
Write-Host "Setting REACT_APP_BACKEND_URL..." -ForegroundColor Cyan
vercel env add REACT_APP_BACKEND_URL production
Write-Host "Enter the value when prompted: https://task-flow-production-71a7.up.railway.app" -ForegroundColor Yellow

# Update REACT_APP_ENV
Write-Host "Setting REACT_APP_ENV..." -ForegroundColor Cyan
vercel env add REACT_APP_ENV production
Write-Host "Enter the value when prompted: production" -ForegroundColor Yellow

Write-Host "✅ Environment variables updated!" -ForegroundColor Green
Write-Host "🔄 Redeploying to apply changes..." -ForegroundColor Yellow
vercel --prod

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your frontend should now be connected to the deployed backend" -ForegroundColor Green
