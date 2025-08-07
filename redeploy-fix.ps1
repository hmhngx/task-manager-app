Write-Host "🚀 Redeploying Task Manager App with CORS and Environment Variable Fixes" -ForegroundColor Green

# Backend redeployment
Write-Host "📦 Redeploying Backend..." -ForegroundColor Yellow
Set-Location "task-manager-backend"
git add .
git commit -m "Fix CORS configuration for Vercel domain"
git push

Write-Host "✅ Backend changes pushed to Railway" -ForegroundColor Green

# Frontend redeployment
Write-Host "📦 Redeploying Frontend..." -ForegroundColor Yellow
Set-Location "../task-manager-frontend"
git add .
git commit -m "Update API configuration and environment variables"
git push

Write-Host "✅ Frontend changes pushed to Vercel" -ForegroundColor Green

Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update Railway environment variables:" -ForegroundColor White
Write-Host "   - FRONTEND_URL=https://task-manager-frontend-harrison-nguyens-projects.vercel.app" -ForegroundColor Gray
Write-Host "   - Make sure MONGODB_URI and JWT_SECRET are set" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update Vercel environment variables:" -ForegroundColor White
Write-Host "   - REACT_APP_API_URL=https://task-flow-production-71a7.up.railway.app" -ForegroundColor Gray
Write-Host "   - REACT_APP_BACKEND_URL=https://task-flow-production-71a7.up.railway.app" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Wait for deployments to complete (usually 2-5 minutes)" -ForegroundColor White
Write-Host "4. Test the application at your Vercel URL" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Deployment fixes applied!" -ForegroundColor Green
