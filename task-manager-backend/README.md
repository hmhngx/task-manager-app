# Task Manager Backend

A robust NestJS backend with **real-time WebSocket integration** and **comprehensive notification system** for the Task Manager application.

## 🚀 Key Features

### Core API
- **User Authentication** with JWT and refresh tokens
- **Role-based Access Control** (Admin/User)
- **Task CRUD Operations** with assignment workflows
- **File Upload** and attachment management
- **Comments System** with mentions
- **Reporting & Analytics** with Excel export

### Real-Time Features
- **WebSocket Integration** for live updates
- **Real-time Notifications** across multiple channels
- **Live Task Updates** and status changes
- **Admin Dashboard** with live monitoring
- **User Activity Tracking** in real-time

### Notification System
- **WebSocket Notifications** - Instant in-app updates
- **Web Push Notifications** - Browser notifications via VAPID
- **Email Notifications** - SMTP integration
- **Scheduled Notifications** - Automated reminders via cron jobs

## 🛠️ Tech Stack

### Core
- **NestJS** with TypeScript
- **MongoDB** with Mongoose ODM
- **Socket.IO** for WebSocket implementation
- **JWT** for authentication

### Notifications
- **Web Push** for browser notifications
- **Nodemailer** for email delivery
- **@nestjs/schedule** for cron jobs

### Utilities
- **Swagger/OpenAPI** for API documentation
- **Class-validator** for input validation
- **Multer** for file uploads
- **ExcelJS** for report generation

## 📦 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- SMTP server
- VAPID keys for push notifications

### Installation
```bash
npm install
cp .env.example .env
# Configure environment variables
npm run start:dev
```

## 🔧 Environment Variables

```bash
# Database
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3001

# Push Notifications (VAPID)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=admin@yourdomain.com

# Email Notifications (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com

# Application
PORT=3000
NODE_ENV=development
```

## 🌐 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout

### Tasks
- `GET /tasks` - Get tasks with filtering
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get specific task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/assign` - Assign task
- `POST /tasks/:id/request` - Request task assignment

### Notifications
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

### Push Notifications
- `GET /auth/push/vapid-public-key` - Get VAPID key
- `POST /auth/push/subscribe` - Subscribe to push
- `DELETE /auth/push/unsubscribe` - Unsubscribe

### Reports
- `GET /reports/tasks` - Task analytics
- `GET /reports/users` - User activity
- `GET /reports/export` - Excel export

## 📡 WebSocket Events

### Client → Server
- `subscribe:task` - Subscribe to task updates
- `subscribe:notifications` - Subscribe to notifications
- `mark:read` - Mark notification as read
- `subscribe:dashboard` - Admin dashboard (admin only)

### Server → Client
- `notification:new` - New notification
- `task:updated` - Task changes
- `comment:added` - New comment
- `admin:task_activity` - Admin activity feed

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control**
- **WebSocket Authentication** with JWT validation
- **CORS Configuration**
- **Input Validation** with class-validator
- **Rate Limiting** and security headers

## 📊 Database Schema

### Users
- Authentication data (email, password hash)
- Profile information (name, role, preferences)
- Push notification subscriptions
- Activity timestamps

### Tasks
- Basic info (title, description, status)
- Assignment data (assignee, creator, watchers)
- Metadata (priority, labels, deadlines)
- Workflow and approval status

### Notifications
- Notification content (title, message, type)
- Delivery status (sent, delivered, read)
- Channel information (websocket, push, email)
- User and task associations

## 🚀 Deployment

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Docker
```bash
docker build -t task-manager-backend .
docker run -p 3000:3000 task-manager-backend
```

## 📚 API Documentation

- **Swagger UI**: `http://localhost:3000/api`
- **OpenAPI Spec**: `http://localhost:3000/api-json`

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Logging & Monitoring

- **Winston** for structured logging
- **Request logging** middleware
- **Error tracking** and debugging
- **Performance monitoring**

---

**Built with NestJS, MongoDB, and Socket.IO**