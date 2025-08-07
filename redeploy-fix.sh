#!/bin/bash

echo "🚀 Redeploying Task Manager App with CORS and Environment Variable Fixes"

# Backend redeployment
echo "📦 Redeploying Backend..."
cd task-manager-backend
git add .
git commit -m "Fix CORS configuration for Vercel domain"
git push

echo "✅ Backend changes pushed to Railway"

# Frontend redeployment
echo "📦 Redeploying Frontend..."
cd ../task-manager-frontend
git add .
git commit -m "Update API configuration and environment variables"
git push

echo "✅ Frontend changes pushed to Vercel"

echo ""
echo "🔧 Next Steps:"
echo "1. Update Railway environment variables:"
echo "   - FRONTEND_URL=https://task-manager-frontend-harrison-nguyens-projects.vercel.app"
echo "   - Make sure MONGODB_URI and JWT_SECRET are set"
echo ""
echo "2. Update Vercel environment variables:"
echo "   - REACT_APP_API_URL=https://task-flow-production-71a7.up.railway.app"
echo "   - REACT_APP_BACKEND_URL=https://task-flow-production-71a7.up.railway.app"
echo ""
echo "3. Wait for deployments to complete (usually 2-5 minutes)"
echo "4. Test the application at your Vercel URL"
echo ""
echo "🎉 Deployment fixes applied!"
