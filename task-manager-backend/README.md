# Task Manager Backend

A robust NestJS backend with **real-time WebSocket integration**, **comprehensive notification system**, **advanced comment system**, and **workflow management** for the Task Manager application.

## 🚀 Key Features

### Core API
- **User Authentication** with JWT and refresh tokens
- **Role-based Access Control** (Admin/User)
- **Task CRUD Operations** with assignment workflows
- **File Upload** and attachment management
- **Advanced Comment System** with voting, replies, and mentions
- **Reporting & Analytics** with Excel export
- **Participant Management** with add/remove functionality
- **Task Request System** with approval workflows

### Advanced Comment System
- **Threaded Comments** with parent-child relationships
- **Voting System** with up/down votes and vote counts
- **Comment Replies** with nested structure
- **User Mentions** with notification system
- **Comment Editing** with edit history tracking
- **Real-time Updates** via WebSocket
- **Attachment Support** for comments
- **Moderation Tools** for admins

### Real-Time Features
- **WebSocket Integration** for live updates across all features
- **Real-time Comments** with instant updates and notifications
- **Live Task Updates** and status changes
- **Admin Dashboard** with live monitoring
- **User Activity Tracking** in real-time
- **Attachment Events** for file upload/delete notifications
- **Participant Management** with live updates

### Comprehensive Notification System
- **WebSocket Notifications** - Instant in-app updates
- **Web Push Notifications** - Browser notifications via VAPID
- **Email Notifications** - SMTP integration
- **Scheduled Notifications** - Automated reminders via cron jobs
- **Comment Notifications** - Mentions, replies, and voting alerts
- **Task Notifications** - Assignments, status changes, and requests
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
- `GET /tasks/my-tasks` - Get user's assigned tasks
- `GET /tasks/created-by-me` - Get user's created tasks
- `GET /tasks/status/:status` - Get tasks by status
- `GET /tasks/stats/weekly` - Get weekly statistics
- `GET /tasks/stats/monthly` - Get monthly statistics

### Comments
- `GET /tasks/:id/comments` - Get task comments
- `POST /tasks/:id/comments` - Add comment
- `PUT /tasks/:id/comments/:commentId` - Update comment
- `DELETE /tasks/:id/comments/:commentId` - Delete comment
- `POST /tasks/:id/comments/:commentId/vote` - Vote on comment

### Attachments
- `POST /tasks/:id/attachments` - Upload attachment
- `DELETE /tasks/:id/attachments/:attachmentId` - Delete attachment
- `GET /tasks/:id/attachments` - Get task attachments
- `GET /attachments/:id/download` - Download attachment

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
- `subscribe:all-tasks` - Subscribe to all tasks (admin only)

### Server → Client
- `notification:new` - New notification
- `task:updated` - Task changes
- `task:created` - New task created
- `task:deleted` - Task deleted
- `task:assigned` - Task assigned
- `task:assignment_removed` - Task assignment removed
- `task:status_changed` - Task status changed
- `comment:added` - New comment
- `comment:replied` - Comment reply
- `comment:edited` - Comment updated
- `comment:deleted` - Comment deleted
- `comment:voted` - Comment voted
- `attachment:uploaded` - File uploaded
- `attachment:deleted` - File deleted
- `participant:added` - Participant added
- `participant:removed` - Participant removed
- `admin:task_activity` - Admin activity feed
- `deadline:reminder` - Deadline reminder
- `task:overdue` - Overdue task alert

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control**
- **WebSocket Authentication** with JWT validation
- **CORS Configuration**
- **Input Validation** with class-validator
- **Rate Limiting** and security headers
- **File Upload Security** with type and size validation
- **SQL Injection Protection** with Mongoose
- **XSS Protection** with input sanitization

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
- Comments and attachments references

### Comments
- Content and author information
- Parent-child relationships for replies
- Voting system with user votes
- Mentions and attachments
- Edit history tracking
- Timestamps and metadata

### Notifications
- Type and priority classification
- User targeting and delivery status
- Read/unread state tracking
- Timestamp and metadata
- Action data for deep linking

### Attachments
- File metadata (name, size, type)
- Storage information and URLs
- Upload tracking and permissions
- Thumbnail generation for images
- Download tracking

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 📈 Performance

### Optimization Features
- **Database Indexing** for fast queries
- **Caching** for frequently accessed data
- **Connection Pooling** for MongoDB
- **File Upload Streaming** for large files
- **WebSocket Connection Management**
- **Rate Limiting** for API protection

### Monitoring
- **Request Logging** with timestamps
- **Error Tracking** and debugging
- **Performance Metrics** collection
- **Database Query Optimization**
- **Memory Usage Monitoring**

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

### Swagger UI
Access the interactive API documentation at `/api` when running in development mode.

### OpenAPI Specification
The API specification is available at `/api-json` for integration with other tools.

## 🔧 Development

### Code Structure
```
src/
├── modules/
│   ├── auth/           # Authentication & authorization
│   ├── tasks/          # Task management
│   ├── notifications/  # Notification system
│   ├── reports/        # Analytics & reporting
│   ├── users/          # User management
│   └── websocket/      # Real-time features
├── shared/
│   └── interfaces/     # Shared TypeScript interfaces
├── config/             # Configuration files
└── exceptions/         # Error handling
```

### Adding New Features
1. Create module in `src/modules/`
2. Define DTOs and schemas
3. Implement service logic
4. Add controller endpoints
5. Update WebSocket events if needed
6. Add tests and documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.