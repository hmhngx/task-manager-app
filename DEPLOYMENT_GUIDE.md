# Deployment Issues Fix Guide

## Issues Identified

1. **CORS Policy Errors**: Frontend can't access backend due to missing domain in CORS configuration
2. **401 Authentication Errors**: Users getting unauthorized errors when accessing protected routes
3. **Environment Variables**: Missing or incorrect environment variables in deployments

## Solutions

### 1. Backend CORS Configuration ✅ FIXED

The backend CORS configuration has been updated to include your specific Vercel domain:
- Added `https://task-manager-frontend-harrison-nguyens-projects.vercel.app`
- Added regex pattern `/^https:\/\/.*\.vercel\.app$/` to allow any Vercel domain

### 2. Environment Variables Setup

#### Backend (Railway) Environment Variables

Set these environment variables in your Railway deployment:

```bash
# Database Configuration
MONGODB_URI=your-mongodb-connection-string

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=24h

# Frontend URL (Update this to your specific Vercel domain)
FRONTEND_URL=https://task-manager-frontend-harrison-nguyens-projects.vercel.app

# Email Configuration (Optional for basic functionality)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-brevo-api-key
SMTP_PASS=your-brevo-api-key
EMAIL_FROM_NAME=TaskFlow

# Application
PORT=8080
NODE_ENV=production
```

#### Frontend (Vercel) Environment Variables

Set these environment variables in your Vercel deployment:

```bash
# Backend API URL (Railway deployment)
REACT_APP_API_URL=https://task-flow-production-71a7.up.railway.app
REACT_APP_BACKEND_URL=https://task-flow-production-71a7.up.railway.app

# Environment
REACT_APP_ENV=production
```

### 3. Deployment Steps

#### Backend (Railway)

1. **Update Environment Variables**:
   - Go to your Railway project dashboard
   - Navigate to the "Variables" tab
   - Add/update the environment variables listed above
   - Make sure `FRONTEND_URL` points to your specific Vercel domain

2. **Redeploy Backend**:
   ```bash
   # The backend should automatically redeploy when you push changes
   git add .
   git commit -m "Fix CORS configuration"
   git push
   ```

#### Frontend (Vercel)

1. **Update Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to "Settings" > "Environment Variables"
   - Add/update the environment variables listed above
   - Make sure `REACT_APP_API_URL` points to your Railway backend URL

2. **Redeploy Frontend**:
   ```bash
   # The frontend should automatically redeploy when you push changes
   git add .
   git commit -m "Update API configuration"
   git push
   ```

### 4. Testing the Fix

1. **Test CORS**:
   - Open browser developer tools
   - Go to your frontend URL
   - Try to register/login
   - Check that there are no CORS errors in the console

2. **Test Authentication**:
   - Register a new user
   - Login with the user
   - Navigate to protected routes
   - Check that you can access the dashboard and tasks

3. **Test API Calls**:
   - Open browser developer tools
   - Go to Network tab
   - Perform actions that make API calls
   - Verify that requests are successful (200 status codes)

### 5. Troubleshooting

#### If CORS errors persist:
1. Check that the backend environment variable `FRONTEND_URL` is set correctly
2. Verify that the backend has been redeployed with the new CORS configuration
3. Clear browser cache and try again

#### If 401 errors persist:
1. Check that the frontend environment variable `REACT_APP_API_URL` is set correctly
2. Verify that the backend is running and accessible
3. Check that JWT tokens are being generated and stored correctly
4. Clear browser localStorage and try logging in again

#### If manifest.json 401 error:
This is likely a separate issue with Vercel's static file serving. Try:
1. Check that the manifest.json file exists in the public folder
2. Verify that the file is being served correctly
3. This error doesn't affect core functionality

### 6. Monitoring

After deployment, monitor:
- Backend logs in Railway dashboard
- Frontend logs in Vercel dashboard
- Browser console for any remaining errors
- Network requests to ensure they're successful

## Quick Fix Commands

If you need to quickly redeploy:

```bash
# Backend
cd task-manager-backend
git add .
git commit -m "Fix CORS and environment variables"
git push

# Frontend  
cd task-manager-frontend
git add .
git commit -m "Update API configuration"
git push
```

Then update the environment variables in both Railway and Vercel dashboards as described above. 