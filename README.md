# Task Manager Application

A full-stack, modern task management application built with React, NestJS, and MongoDB.  
Supports user/admin roles, task assignment, approval workflows, comments, attachments, and **real-time collaboration** via WebSocket integration with comprehensive notification system.

---

## Project Structure

├── task-manager-frontend/ # React frontend with Redux and WebSocket
├── task-manager-backend/ # NestJS backend with WebSocket and Push Notifications
└── README.md # This file


---

## Features

- User authentication (JWT)
- Admin and user roles
- Create, read, update, delete (CRUD) tasks
- Task assignment and approval workflow
- Task request/approval/rejection by admin
- Comments and file attachments on tasks
- Task status management (todo, in progress, done, late, etc.)
- Dashboard and reporting with data visualization
- **Real-time collaboration via WebSocket integration**
- **Live task updates and notifications**
- **Real-time comments and mentions**
- **Admin dashboard with live monitoring**
- **Live activity feed**
- **Comprehensive notification system**
- **Web Push notifications**
- **Email notifications**
- **Scheduled notifications (deadlines, overdue)**
- **Notification preferences and management**
- Responsive UI with Tailwind CSS
- State management with Redux Toolkit
- API documentation with Swagger

---

## Real-Time Notification System

The application includes a comprehensive real-time notification system with multiple delivery channels:

### WebSocket Notifications
- **Live Task Updates**: All task changes are broadcast instantly to relevant users
- **Assignment & Mention Notifications**: Users receive immediate alerts for task assignments and when they are mentioned in comments
- **Task Request Alerts**: Admins are notified of new task requests, and users receive real-time updates on the status of their requests
- **Comment Notifications**: Real-time alerts when comments are added, edited, or deleted
- **Participant Changes**: Notifications when users are added to or removed from tasks

### Web Push Notifications
- **Browser Notifications**: Desktop notifications even when the app is closed
- **VAPID Protocol**: Secure push notification delivery
- **Service Worker Integration**: Background notification handling
- **Notification Actions**: Click to navigate directly to tasks
- **Permission Management**: User-controlled notification preferences

### Email Notifications
- **SMTP Integration**: Email delivery via nodemailer
- **HTML Templates**: Rich email notifications with task details
- **Deadline Reminders**: Automated email reminders for upcoming deadlines
- **Overdue Alerts**: Email notifications for overdue tasks

### Scheduled Notifications
- **Cron Jobs**: Automated notification scheduling
- **Deadline Approaching**: Notifications sent 24 hours before deadlines
- **Overdue Tasks**: Hourly checks for overdue tasks
- **Customizable Timing**: Configurable notification schedules

---

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- SMTP server (for email notifications)
- VAPID keys (for push notifications)

---

## Getting Started

### 1. Backend Setup

```bash
cd task-manager-backend
npm install
```

Create a `.env` file:
```bash
# Database
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001

# VAPID Keys for Web Push Notifications
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=admin@yourdomain.com

# SMTP Configuration (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

Start the backend:
```bash
npm run start:dev
```
- API: http://localhost:3000
- WebSocket: ws://localhost:3000
- Swagger docs: http://localhost:3000/api

---

### 2. Frontend Setup

```bash
cd task-manager-frontend
npm install
```

Create a `.env` file:

```bash
REACT_APP_BACKEND_URL=http://localhost:3000
REACT_APP_ENV=development
```


Start the frontend:
```bash
npm start
```
- App: http://localhost:3001

---

## Technologies Used

### Frontend
- **React** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Socket.IO client** for real-time communication
- **Service Worker** for push notifications
- **Web Push API** for browser notifications
- **XLSX** for Excel export
- **Day.js** for date handling

### Backend
- **NestJS** with TypeScript
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Passport.js** for auth strategies
- **Socket.IO** for WebSocket functionality
- **Web Push** for push notifications
- **Nodemailer** for email notifications
- **@nestjs/schedule** for cron jobs
- **Swagger** for API documentation
- **Class-validator** for input validation

---

## Notification System Architecture

### Backend Components
```
src/modules/
├── notifications/
│   ├── notification.module.ts
│   ├── notification.controller.ts
│   ├── notification.gateway.ts
│   ├── services/
│   │   ├── notification.service.ts
│   │   ├── push.service.ts
│   │   └── notification-cron.service.ts
│   └── schemas/
│       ├── notification.schema.ts
│       └── push-subscription.schema.ts
└── websocket/
    ├── gateways/
    │   ├── task.gateway.ts
    │   ├── notification.gateway.ts
    │   └── admin.gateway.ts
    ├── services/
    │   └── websocket.service.ts
    └── guards/
        └── websocket-auth.guard.ts
```

### Frontend Components
```
src/
├── contexts/
│   ├── WebSocketContext.tsx
│   └── NotificationContext.tsx
├── hooks/
│   ├── useTaskSocket.ts
│   ├── useNotificationSocket.ts
│   └── useCommentSocket.ts
├── components/
│   ├── NotificationBox.tsx
│   └── NotificationToast.tsx
├── services/
│   └── pushService.ts
├── store/
│   └── notificationSlice.ts
└── shared/
    └── interfaces/
        └── notification.interface.ts
```

---

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and receive JWT
- `POST /auth/push/subscribe` - Subscribe to push notifications
- `DELETE /auth/push/unsubscribe` - Unsubscribe from push notifications

### Tasks
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create new task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/request` - Request task assignment
- `POST /tasks/:id/approve` - Approve task request (admin)
- `POST /tasks/:id/reject` - Reject task request (admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Reports
- `GET /reports/tasks` - Get task reports
- `GET /tasks/stats` - Get task statistics
- `GET /tasks/stats/weekly` - Get weekly statistics

---

## WebSocket Events

### Client to Server
- `subscribe:task` - Subscribe to specific task updates
- `subscribe:notifications` - Subscribe to notifications
- `mark:read` - Mark notification as read
- `subscribe:dashboard` - Subscribe to admin dashboard (admin only)

### Server to Client
- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `task:assigned` - Task assigned to user
- `task:status_changed` - Task status changed
- `comment:added` - New comment added
- `notification:new` - New notification received
- `admin:task_activity` - Admin dashboard activity

---

## Troubleshooting

### General Issues
- **Blank screen after update:** Check browser console for errors, ensure backend is running
- **API 500 errors:** Check backend logs for stack traces
- **MongoDB connection issues:** Verify your `MONGODB_URI` and database status
- **Redux state issues:** Check Redux DevTools for state updates and actions

### WebSocket Issues
- **WebSocket connection issues:** Check CORS configuration and JWT token validity
- **Real-time events not working:** Verify WebSocket connection status and room subscriptions
- **Connection drops:** Check network stability and reconnection logic

### Notification Issues
- **Push notifications not working:** Verify VAPID keys and browser permissions
- **Email notifications failing:** Check SMTP configuration and credentials
- **Scheduled notifications missing:** Verify cron job configuration and MongoDB connection
- **WebSocket notifications delayed:** Check connection status and event handling

---

## Production Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- Database connection strings
- JWT secrets
- VAPID keys for push notifications
- SMTP configuration for email notifications
- CORS origins for security

### HTTPS Requirements
- Web Push notifications require HTTPS in production
- Configure SSL certificates for both frontend and backend
- Update service worker for production URLs

### Performance Optimization
- Configure MongoDB indexes for notification queries
- Set up Redis for WebSocket session management (optional)
- Implement rate limiting for notification endpoints
- Monitor WebSocket connection counts and memory usage

---

## License

MIT