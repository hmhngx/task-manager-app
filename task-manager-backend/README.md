# Task Manager Backend

A robust NestJS backend with **real-time WebSocket integration**, **comprehensive notification system**, and **advanced task management** for the Task Manager application.

## 🚀 Key Features

### Core API
- **User Authentication** with JWT and refresh tokens
- **Role-based Access Control** (Admin/User)
- **Task CRUD Operations** with assignment workflows
- **File Upload** and attachment management
- **Comments System** with mentions and real-time updates
- **Reporting & Analytics** with Excel export
- **Participant Management** with add/remove functionality

### Real-Time Features
- **WebSocket Integration** for live updates
- **Real-time Notifications** across multiple channels
- **Live Task Updates** and status changes
- **Admin Dashboard** with live monitoring
- **User Activity Tracking** in real-time
- **Attachment Events** for file upload/delete notifications

### Notification System
- **WebSocket Notifications** - Instant in-app updates
- **Web Push Notifications** - Browser notifications via VAPID
- **Email Notifications** - SMTP integration
- **Scheduled Notifications** - Automated reminders via cron jobs
- **Notification Management** - Mark as read, filtering, bulk operations
- **Priority-based Notifications** - Urgent, high, medium, low priorities

## 🛠️ Tech Stack

### Core
- **NestJS** with TypeScript
- **MongoDB** with Mongoose ODM
- **Socket.IO** for WebSocket implementation
- **JWT** for authentication with refresh tokens

### Notifications
- **Web Push** for browser notifications
- **Nodemailer** for email delivery
- **@nestjs/schedule** for cron jobs
- **VAPID** for push notification keys

### Utilities
- **Swagger/OpenAPI** for API documentation
- **Class-validator** for input validation
- **Multer** for file uploads
- **ExcelJS** for report generation
- **Cron** for scheduled tasks

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
- `POST /tasks/:id/participants` - Add participant
- `DELETE /tasks/:id/participants/:userId` - Remove participant

### Comments
- `GET /tasks/:id/comments` - Get task comments
- `POST /tasks/:id/comments` - Add comment
- `PUT /tasks/:id/comments/:commentId` - Update comment
- `DELETE /tasks/:id/comments/:commentId` - Delete comment

### Attachments
- `POST /tasks/:id/attachments` - Upload attachment
- `DELETE /tasks/:id/attachments/:attachmentId` - Delete attachment
- `GET /tasks/:id/attachments` - Get task attachments

### Notifications
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `GET /notifications/unread-count` - Get unread count
- `DELETE /notifications` - Clear all notifications
- `DELETE /notifications/read` - Clear read notifications

### Push Notifications
- `GET /auth/push/vapid-public-key` - Get VAPID key
- `POST /auth/push/subscribe` - Subscribe to push
- `DELETE /auth/push/unsubscribe` - Unsubscribe

### Reports
- `GET /reports/tasks` - Task analytics
- `GET /reports/users` - User activity
- `GET /reports/export` - Excel export

### Users
- `GET /users` - Get users (admin only)
- `GET /users/:id` - Get specific user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (admin only)

## 📡 WebSocket Events

### Client → Server
- `subscribe:task` - Subscribe to task updates
- `subscribe:notifications` - Subscribe to notifications
- `mark:read` - Mark notification as read
- `subscribe:dashboard` - Admin dashboard (admin only)
- `subscribe:comments` - Subscribe to comment updates
- `subscribe:attachments` - Subscribe to attachment events

### Server → Client
- `notification:new` - New notification
- `task:updated` - Task changes
- `task:created` - New task created
- `task:deleted` - Task deleted
- `comment:added` - New comment
- `comment:updated` - Comment updated
- `comment:deleted` - Comment deleted
- `attachment:uploaded` - File uploaded
- `attachment:deleted` - File deleted
- `participant:added` - Participant added
- `participant:removed` - Participant removed
- `admin:task_activity` - Admin activity feed

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control**
- **WebSocket Authentication** with JWT validation
- **CORS Configuration**
- **Input Validation** with class-validator
- **Rate Limiting** and security headers
- **File Upload Security** with type and size validation

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
- Participants array

### Comments
- Content and metadata
- User associations
- Task associations
- Timestamps and edit history

### Attachments
- File metadata (name, size, type)
- Storage information
- User and task associations
- Upload timestamps

### Notifications
- Notification content (title, message, type)
- Delivery status (sent, delivered, read)
- Channel information (websocket, push, email)
- User and task associations
- Priority levels

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

## 🔧 Development

### Code Structure
```
src/
├── modules/
│   ├── auth/           # Authentication & authorization
│   ├── tasks/          # Task management
│   ├── notifications/  # Notification system
│   ├── users/          # User management
│   ├── reports/        # Analytics & reporting
│   └── websocket/      # WebSocket gateways
├── shared/
│   └── interfaces/     # Shared interfaces
└── config/             # Configuration files
```

### Key Services
- **TaskService** - Core task management
- **NotificationService** - Notification handling
- **WebSocketService** - Real-time communication
- **AttachmentService** - File management
- **CommentService** - Comment handling

## 🆘 Support

For issues and questions:
1. Check the [Issues](../../issues) page
2. Review the API documentation
3. Create a new issue with detailed information

---

**Built with ❤️ using NestJS, MongoDB, and Socket.IO**