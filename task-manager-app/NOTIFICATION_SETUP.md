# Notification System Setup Guide

This guide will help you set up the comprehensive notification system for the Task Manager app, including WebSocket real-time notifications and Web Push notifications.

## Prerequisites

- Node.js 18+ installed
- MongoDB running
- Both backend and frontend dependencies installed

## 1. VAPID Keys Generation

VAPID keys are required for Web Push notifications. Generate them using the following command:

```bash
npx web-push generate-vapid-keys
```

This will output something like:
```
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa1HI...

Private Key:
VkYpKzVxMC05aXdoakpHTnV5MWpq...
=======================================
```

## 2. Environment Variables

### Backend (.env in task-manager-backend/)

Add these variables to your backend `.env` file:

```env
# VAPID Keys for Web Push Notifications
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=admin@yourdomain.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001

# MongoDB URI
MONGODB_URI=mongodb://localhost:27017/task-manager

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# SMTP Configuration (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

### Frontend (.env in task-manager-frontend/)

Add these variables to your frontend `.env` file:

```env
REACT_APP_BACKEND_URL=http://localhost:3000
```

## 3. Database Setup

The notification system will automatically create the required collections when you start the backend:

- `notifications` - Stores notification records
- `pushsubscriptions` - Stores push notification subscriptions

## 4. Starting the Application

### Backend
```bash
cd task-manager-backend
npm run start:dev
```

### Frontend
```bash
cd task-manager-frontend
npm start
```

## 5. Testing the Notification System

### WebSocket Notifications

1. **Login to the application**
2. **Create a task** - You should see real-time notifications
3. **Update a task status** - Notifications should appear immediately
4. **Add a comment** - Comment notifications should appear
5. **Check the notification bell** - Red badge should show unread count

### Web Push Notifications

1. **Login to the application**
2. **Allow notifications** when prompted by the browser
3. **Close the browser tab** or minimize the window
4. **Create/update tasks from another browser/device**
5. **Check for push notifications** on your desktop/mobile

### Cron Job Notifications

1. **Create tasks with deadlines** (past due or upcoming)
2. **Wait for the cron jobs to run**:
   - Overdue tasks: Every hour
   - Upcoming deadlines: Every 6 hours
3. **Check for deadline notifications**

## 6. Notification Types

The system supports the following notification types:

- **Task Created** - Broadcast to all users
- **Task Updated** - Notify task participants
- **Task Assigned** - Notify assignee
- **Task Status Changed** - Notify participants
- **Task Deleted** - Notify participants
- **Task Request** - Notify admins
- **Task Request Response** - Notify requester
- **Comment Added** - Notify task participants
- **Comment Edited** - Notify task participants
- **Comment Deleted** - Notify task participants
- **Participant Added** - Notify new participant
- **Participant Removed** - Notify removed participant
- **Deadline Approaching** - Notify participants (cron)
- **Task Overdue** - Notify participants (cron)
- **Deadline Changed** - Notify participants

## 7. API Endpoints

### Push Subscription Endpoints

- `GET /auth/push/vapid-public-key` - Get VAPID public key
- `POST /auth/push/subscribe` - Register push subscription
- `GET /auth/push/subscriptions` - Get user subscriptions
- `DELETE /auth/push/unsubscribe/:endpoint` - Unregister subscription
- `DELETE /auth/push/subscriptions` - Deactivate all subscriptions

### Notification Endpoints

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

## 8. Troubleshooting

### WebSocket Issues

1. **Check CORS settings** in backend
2. **Verify JWT token** is valid
3. **Check browser console** for connection errors
4. **Ensure backend is running** on correct port

### Push Notification Issues

1. **Verify VAPID keys** are correctly set
2. **Check browser permissions** for notifications
3. **Ensure HTTPS** in production (required for push)
4. **Check service worker** registration
5. **Verify subscription** is saved in database

### Cron Job Issues

1. **Check logs** for cron job execution
2. **Verify MongoDB connection**
3. **Check task deadlines** are properly set
4. **Ensure NotificationService** is properly injected

## 9. Production Deployment

### Backend

1. **Set production environment variables**
2. **Use HTTPS** for Web Push notifications
3. **Configure proper CORS** for your domain
4. **Set up MongoDB** with proper authentication
5. **Configure logging** for monitoring

### Frontend

1. **Build the application** with `npm run build`
2. **Serve with HTTPS** (required for push notifications)
3. **Update service worker** if needed
4. **Configure proper CORS** origins

## 10. Security Considerations

1. **Keep VAPID private key secure**
2. **Validate JWT tokens** for all WebSocket connections
3. **Sanitize notification content**
4. **Rate limit** notification endpoints
5. **Monitor** for abuse patterns

## 11. Performance Optimization

1. **Index MongoDB collections** properly
2. **Limit notification history** (cleanup old notifications)
3. **Batch notifications** when possible
4. **Use connection pooling** for WebSocket
5. **Monitor memory usage** for large notification lists

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check backend logs for server errors
3. Verify all environment variables are set
4. Ensure MongoDB is running and accessible
5. Test with a simple notification first

The notification system is designed to be robust and scalable, providing real-time updates and offline notifications for a better user experience. 