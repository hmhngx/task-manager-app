# Task Manager Backend

A robust backend for the Task Manager app, built with NestJS, MongoDB, and TypeScript, featuring **real-time WebSocket integration** and **comprehensive notification system** for live collaboration.

---

## Features

### Core Functionality
- User registration and login (JWT with refresh tokens)
- Admin and user roles with role-based access control
- Task CRUD (create, read, update, delete) operations
- Task assignment and approval workflow
- Task request/approval/rejection endpoints
- Comments and file attachments with upload handling
- Task watchers and requesters management
- Task statistics and reporting endpoints
- Advanced filtering and pagination
- File upload and attachment management
- User management and profile settings

### Real-Time Features
- **Real-time WebSocket integration**
- **Live task updates and notifications**
- **Real-time comments and mentions**
- **Admin dashboard monitoring**
- **Live activity feed**
- **Real-time task statistics and reporting**
- **Live user presence and activity tracking**

### Comprehensive Notification System
- **Multi-channel notification delivery**
- **Web Push notifications with VAPID protocol**
- **Email notifications via SMTP**
- **Scheduled notifications with cron jobs**
- **Notification preferences and management**
- **Notification filtering and search**
- **Mark as read functionality (individual and bulk)**
- **Notification templates and customization**
- **Notification delivery tracking and analytics**

### Advanced Features
- Input validation with class-validator
- API documentation with Swagger/OpenAPI
- Unit tests with Jest
- Error handling middleware
- Request logging and monitoring
- Performance optimization
- Security features and rate limiting
- Database indexing and optimization
- Background job processing
- Audit trails and activity logging

---

## Tech Stack

### Core Framework
- **NestJS** with TypeScript for scalable server-side applications
- **MongoDB** with Mongoose ODM for database management
- **TypeScript** for type safety and better development experience

### Authentication & Security
- **JWT** for stateless authentication with refresh tokens
- **Passport.js** for authentication strategies
- **Bcrypt** for password hashing
- **Helmet** for security headers
- **Class-validator** for input validation and DTOs
- **Class-transformer** for object transformation

### Real-Time Communication
- **Socket.IO** for real-time WebSocket functionality
- **Web Push** for push notification delivery
- **Nodemailer** for email notification delivery

### Scheduling & Background Jobs
- **@nestjs/schedule** for cron job scheduling
- **Background job processing** for heavy operations

### File Handling & Processing
- **Multer** for file upload handling
- **Sharp** for image processing
- **ExcelJS** for Excel file generation

### Utilities & Libraries
- **Winston** for logging and monitoring
- **Compression** for response compression
- **Date-fns** for date manipulation
- **UUID** for unique identifier generation
- **Swagger/OpenAPI** for API documentation

### Development Tools
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **Jest** for testing framework
- **Supertest** for API testing

---

## Notification System

The application includes a comprehensive real-time notification system with multiple delivery channels.

### WebSocket Notifications
- **Task Broadcasts**: Notifies all connected clients on task creation, updates, and deletion
- **Assignment Alerts**: Sends a direct notification to a user when they are assigned a new task
- **Task Requests**: Admins receive notifications for new task requests, and users are notified when their requests are approved or rejected
- **Comment & Mention Alerts**: Notifies all task participants when a new comment is added. Users receive a special notification when mentioned in a comment
- **Status Updates**: All participants are notified when a task's status changes
- **Participant Changes**: Notifies users when they are added to or removed from a task
- **Deadline Notifications**: Immediate alerts for deadline changes

### Web Push Notifications
- **Browser Notifications**: Desktop notifications even when the app is closed
- **VAPID Protocol**: Secure push notification delivery using VAPID keys
- **Service Worker Integration**: Background notification handling
- **Notification Actions**: Click to navigate directly to tasks
- **Permission Management**: User-controlled notification preferences
- **Subscription Management**: Store and manage push subscriptions
- **Cross-platform Support**: Works on desktop and mobile browsers

### Email Notifications
- **SMTP Integration**: Email delivery via nodemailer
- **HTML Templates**: Rich email notifications with task details
- **Deadline Reminders**: Automated email reminders for upcoming deadlines
- **Overdue Alerts**: Email notifications for overdue tasks
- **Task Assignments**: Email notifications when tasks are assigned
- **Status Changes**: Email notifications for important status updates
- **Customizable Templates**: Branded email templates

### Scheduled Notifications
- **Cron Jobs**: Automated notification scheduling using @nestjs/schedule
- **Deadline Approaching**: Notifications sent 24 hours before deadlines
- **Overdue Tasks**: Hourly checks for overdue tasks
- **Customizable Timing**: Configurable notification schedules
- **Batch Processing**: Efficient handling of multiple notifications
- **Retry Logic**: Automatic retry for failed notifications

### WebSocket Events

#### Client to Server
- `subscribe:task` - Subscribe to specific task updates
- `unsubscribe:task` - Unsubscribe from task updates
- `subscribe:all-tasks` - Subscribe to all tasks (admin only)
- `subscribe:notifications` - Subscribe to notifications
- `mark:read` - Mark notification as read
- `mark-all-read` - Mark all notifications as read
- `get-count` - Get unread notification count
- `subscribe:dashboard` - Subscribe to admin dashboard (admin only)
- `subscribe:user-activity` - Subscribe to user activity (admin only)
- `subscribe:stats` - Subscribe to statistics updates (admin only)

#### Server to Client
- `notification:new` - New notification received
- `notification:marked_read` - Notification marked as read
- `notification:all_marked_read` - All notifications marked as read
- `notification:count` - Unread notification count update
- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `task:assigned` - Task assigned to user
- `task:status_changed` - Task status changed
- `comment:added` - New comment added
- `comment:edited` - Comment edited
- `comment:deleted` - Comment deleted
- `admin:task_activity` - Admin dashboard activity
- `admin:task_request` - New task request (admin only)
- `deadline:reminder` - Deadline reminder notification
- `overdue:alert` - Overdue task alert

### API Endpoints for Notifications

#### Push Notifications
- `GET /auth/push/vapid-public-key` - Get VAPID public key
- `POST /auth/push/subscribe` - Register push subscription
- `GET /auth/push/subscriptions` - Get user subscriptions
- `DELETE /auth/push/unsubscribe/:endpoint` - Unregister subscription
- `DELETE /auth/push/subscriptions` - Deactivate all subscriptions

#### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications` - Clear all notifications

#### Task Management
- `POST /tasks/request` - Request task assignment
- `POST /tasks/:id/approve` - Approve task request (admin)
- `POST /tasks/:id/reject` - Reject task request (admin)
- `POST /tasks/:id/participants` - Add participant to task (admin)
- `DELETE /tasks/:id/participants/:participantId` - Remove participant from task (admin)

---

## Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd task-manager-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate VAPID keys for push notifications:
   ```bash
   npx web-push generate-vapid-keys
   ```

4. Create a `.env` file:
   ```
   # Database
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3000
   NODE_ENV=development
   
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

5. Start the app:
   ```bash
   npm run start:dev
   ```

6. Access the API at [http://localhost:3000](http://localhost:3000)  
   WebSocket at [ws://localhost:3000/tasks](ws://localhost:3000/tasks)  
   Swagger docs: [http://localhost:3000/api](http://localhost:3000/api)

---

## Main API Endpoints

### Authentication
- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login and receive a JWT
- `POST /auth/refresh` — Refresh access token
- `POST /auth/logout` — Logout and invalidate tokens
- `POST /auth/register/admin` — Register admin user (admin only)
- `GET /auth/push/vapid-public-key` — Get VAPID public key
- `POST /auth/push/subscribe` — Subscribe to push notifications
- `GET /auth/push/subscriptions` — Get user subscriptions
- `DELETE /auth/push/unsubscribe/:endpoint` — Unregister subscription
- `DELETE /auth/push/subscriptions` — Deactivate all subscriptions

### Tasks
- `GET /tasks` — Get all tasks for the authenticated user
- `GET /tasks/:id` — Get a specific task
- `POST /tasks` — Create a new task
- `PATCH /tasks/:id` — Update a task
- `DELETE /tasks/:id` — Delete a task
- `POST /tasks/:id/request` — Request assignment to a task
- `POST /tasks/:id/approve` — Admin approves a user's request
- `POST /tasks/:id/reject` — Admin rejects a user's request
- `POST /tasks/:id/participants` — Add participant to task (admin)
- `DELETE /tasks/:id/participants/:participantId` — Remove participant from task (admin)
- `GET /tasks/stats` — Get task statistics
- `GET /tasks/stats/weekly` — Get weekly task statistics
- `GET /tasks/stats/weekly/detailed` — Get detailed weekly statistics
- `POST /tasks/:id/attachments` — Upload an attachment
- `POST /tasks/:id/comments` — Add a comment

### Notifications
- `GET /api/notifications` — Get user notifications
- `PUT /api/notifications/:id/read` — Mark notification as read
- `PUT /api/notifications/read-all` — Mark all notifications as read
- `DELETE /api/notifications/:id` — Delete notification
- `DELETE /api/notifications` — Clear all notifications

### Comments
- `POST /tasks/:id/comments` — Add comment to task
- `PUT /tasks/:id/comments/:commentId` — Update comment
- `DELETE /tasks/:id/comments/:commentId` — Delete comment

### Attachments
- `POST /tasks/:id/attachments` — Upload attachment
- `DELETE /tasks/:id/attachments/:attachmentId` — Delete attachment

### Reports
- `GET /reports/tasks` — Get task reports with filtering

---

## Environment Variables

### Required
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for JWT authentication
- `PORT` — Server port (default: 3000)
- `NODE_ENV` — Environment (development/production)
- `FRONTEND_URL` — Frontend URL for CORS configuration

### Push Notifications
- `VAPID_PUBLIC_KEY` — VAPID public key for push notifications
- `VAPID_PRIVATE_KEY` — VAPID private key for push notifications
- `VAPID_EMAIL` — Email address for VAPID identification

### Email Notifications
- `SMTP_HOST` — SMTP server host
- `SMTP_PORT` — SMTP server port
- `SMTP_SECURE` — Use SSL/TLS (true/false)
- `SMTP_USER` — SMTP username
- `SMTP_PASS` — SMTP password
- `SMTP_FROM` — From email address

---

## Database Schema

### Core Collections
- **users** - User accounts and profiles
- **tasks** - Task data and metadata
- **comments** - Task comments and mentions
- **attachments** - File attachments and metadata
- **workflows** - Task workflow definitions
- **refresh_tokens** - JWT refresh tokens

### Notification Collections
- **notifications** - Notification records and status
- **push_subscriptions** - Web Push subscription data

### Notifications Collection
```typescript
interface Notification {
  _id: ObjectId;
  userId: ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
  priority: NotificationPriority;
  taskId?: ObjectId;
}
```

### Push Subscriptions Collection
```typescript
interface PushSubscription {
  _id: ObjectId;
  userId: ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  lastUsed: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Schema Features
- **Indexing** - Optimized queries for performance
- **Validation** - Data integrity and type safety
- **Relationships** - Proper references between collections
- **Audit Trails** - Timestamps and change tracking
- **Soft Deletes** - Data preservation and recovery

---

## Error Handling

- All endpoints return appropriate HTTP status codes and error messages
- Centralized error handling middleware
- Request validation using class-validator
- Detailed error logging with Winston
- Stack traces in development mode only
- WebSocket error handling with reconnection logic
- Notification delivery error handling and retry logic
- Push notification failure handling and cleanup
- Database error handling and recovery
- Rate limiting and throttling

---

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov

# Test notifications
node test-notifications.js
```

### Test Coverage
- **Unit tests** for individual services and controllers
- **Integration tests** for API endpoints
- **E2E tests** for complete workflows
- **WebSocket tests** for real-time functionality
- **Notification tests** for delivery systems
- **Database tests** for data integrity

---

## API Documentation

The API is documented using Swagger/OpenAPI. Access the documentation at:
- Development: http://localhost:3000/api
- Production: https://your-domain.com/api

### Documentation Features
- **Interactive API explorer**
- **Request/response examples**
- **Authentication documentation**
- **WebSocket event documentation**
- **Error code documentation**
- **Schema definitions**

---

## WebSocket Configuration

### CORS Setup
```typescript
@WebSocketGateway({
  namespace: '/tasks',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
```

### Authentication
WebSocket connections require valid JWT tokens passed in the auth object:
```typescript
const socket = io(`${backendUrl}/tasks`, {
  auth: { token: jwtToken },
  transports: ['websocket'],
});
```

### Room Management
- User-specific rooms: `user._id.toString()`
- Task-specific rooms: `task:${taskId}`
- Admin room: `admin-room`
- All tasks room: `all-tasks`
- All notifications room: `all-notifications`

### Connection Management
- **Authentication guard** for all WebSocket connections
- **Room subscription** based on user permissions
- **Connection state tracking** and monitoring
- **Automatic cleanup** for disconnected users
- **Error handling** and reconnection logic

---

## Cron Jobs

The application includes scheduled tasks for automated notifications:

### Deadline Reminders
- **Schedule**: Every 6 hours
- **Purpose**: Send reminders for tasks with approaching deadlines
- **Target**: Task assignees and creators
- **Channels**: Email, Web Push, WebSocket

### Overdue Task Alerts
- **Schedule**: Every hour
- **Purpose**: Send alerts for overdue tasks
- **Target**: Task assignees and creators
- **Channels**: Email, Web Push, WebSocket

### Customization
Cron schedules can be modified in `src/modules/notifications/services/notification-cron.service.ts`

### Job Management
- **Job scheduling** with @nestjs/schedule
- **Job monitoring** and logging
- **Error handling** and retry logic
- **Performance optimization** for large datasets

---

## Performance Optimization

### Database Optimization
```javascript
// Create indexes for notification queries
db.notifications.createIndex({ userId: 1, read: 1, timestamp: -1 });
db.notifications.createIndex({ taskId: 1, timestamp: -1 });
db.pushsubscriptions.createIndex({ userId: 1 });
db.tasks.createIndex({ assignee: 1, status: 1 });
db.comments.createIndex({ task: 1, createdAt: -1 });
```

### Caching Strategies
- **Redis integration** for session management (optional)
- **Cache frequently accessed** notification data
- **Implement notification batching** for high-volume scenarios
- **Database query optimization** with proper indexing

### Rate Limiting
- **API rate limiting** for protection against abuse
- **WebSocket event throttling** for performance
- **Notification delivery rate limiting** to prevent spam
- **User-specific rate limits** based on subscription tiers

### Background Processing
- **Queue management** for heavy operations
- **Batch processing** for multiple notifications
- **Async job handling** for file uploads
- **Memory management** and garbage collection

---

## Security Considerations

### Authentication & Authorization
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (RBAC)
- **Password hashing** with bcrypt
- **Token blacklisting** for logout
- **Session management** and timeout

### WebSocket Security
- **JWT authentication** for all WebSocket connections
- **User isolation** through personal rooms
- **Input validation** for all WebSocket events
- **Rate limiting** for WebSocket events
- **Connection monitoring** and abuse prevention

### Push Notifications
- **VAPID key security** (keep private key secure)
- **Subscription validation** and verification
- **User permission verification**
- **Notification content sanitization**
- **Endpoint validation** and cleanup

### Email Notifications
- **SMTP authentication** and encryption
- **Email content validation** and sanitization
- **Rate limiting** for email sending
- **Bounce handling** and cleanup
- **Spam prevention** measures

### General Security
- **HTTPS enforcement** in production
- **CORS configuration** for cross-origin requests
- **Input validation** and sanitization
- **SQL injection prevention** (MongoDB)
- **XSS prevention** with proper sanitization
- **CSRF protection** for API calls
- **Security headers** with Helmet
- **Rate limiting** for API endpoints

---

## Monitoring and Logging

### Application Monitoring
- **Winston logging** with multiple transports
- **Error tracking** and alerting
- **Performance metrics** collection
- **Health checks** for services
- **Uptime monitoring** and alerts

### WebSocket Monitoring
- **Connection count tracking**
- **Event frequency monitoring**
- **Error rate tracking**
- **Performance metrics**
- **Room occupancy monitoring**

### Notification Monitoring
- **Delivery success rates**
- **Push notification failure tracking**
- **Email delivery monitoring**
- **Cron job execution logging**
- **Notification queue monitoring**

### Database Monitoring
- **Query performance tracking**
- **Connection pool monitoring**
- **Index usage statistics**
- **Storage and memory usage**
- **Slow query detection**

### Health Checks
- **Database connectivity**
- **WebSocket server status**
- **Push notification service health**
- **Email service availability**
- **External service dependencies**

---

## Deployment

### Environment Setup
- **Production environment variables**
- **Database configuration** and optimization
- **SSL certificates** for HTTPS
- **Domain configuration** and DNS setup
- **Load balancing** configuration (if needed)

### Performance Tuning
- **Database indexing** for production queries
- **Connection pooling** optimization
- **Memory management** and garbage collection
- **CPU optimization** for high load
- **Network optimization** and CDN setup

### Security Hardening
- **Firewall configuration**
- **Rate limiting** implementation
- **Security headers** configuration
- **SSL/TLS** optimization
- **Access control** and monitoring

### Monitoring Setup
- **Application performance monitoring** (APM)
- **Log aggregation** and analysis
- **Alert system** configuration
- **Backup and recovery** procedures
- **Disaster recovery** planning

---

## License

MIT License - see LICENSE file for details

---

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation and troubleshooting guides
- Review the API documentation at `/api` endpoint
- Contact the development team

---

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional commits** for commit messages
- **JSDoc** for documentation