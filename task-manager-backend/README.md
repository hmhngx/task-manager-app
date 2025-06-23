# Task Manager Backend

A robust backend for the Task Manager app, built with NestJS, MongoDB, and TypeScript, featuring **real-time WebSocket integration** and **comprehensive notification system** for live collaboration.

---

## Features

- User registration and login (JWT)
- Admin and user roles
- Task CRUD (create, read, update, delete)
- Task assignment and approval workflow
- Task request/approval/rejection endpoints
- Comments and file attachments
- Task watchers and requesters
- Task statistics and reporting endpoints
- Advanced filtering and pagination
- **Real-time WebSocket integration**
- **Live task updates and notifications**
- **Real-time comments and mentions**
- **Admin dashboard monitoring**
- **Live activity feed**
- **Comprehensive notification system**
- **Web Push notifications with VAPID**
- **Email notifications via SMTP**
- **Scheduled notifications with cron jobs**
- **Notification preferences and management**
- Input validation with class-validator
- API documentation with Swagger
- Unit tests with Jest
- Error handling middleware
- Request logging and monitoring

---

## Tech Stack

- **NestJS**: Backend framework
- **MongoDB**: Database with Mongoose ODM
- **TypeScript**: Type-safe JavaScript
- **JWT**: Authentication
- **Socket.IO**: Real-time WebSocket communication
- **Web Push**: Push notification delivery
- **Nodemailer**: Email notification delivery
- **@nestjs/schedule**: Cron job scheduling
- **Swagger**: API documentation
- **Class-validator**: Input validation
- **Passport.js**: Authentication strategies
- **Winston**: Logging

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

### Web Push Notifications
- **Browser Notifications**: Desktop notifications even when the app is closed
- **VAPID Protocol**: Secure push notification delivery using VAPID keys
- **Service Worker Integration**: Background notification handling
- **Notification Actions**: Click to navigate directly to tasks
- **Permission Management**: User-controlled notification preferences
- **Subscription Management**: Store and manage push subscriptions

### Email Notifications
- **SMTP Integration**: Email delivery via nodemailer
- **HTML Templates**: Rich email notifications with task details
- **Deadline Reminders**: Automated email reminders for upcoming deadlines
- **Overdue Alerts**: Email notifications for overdue tasks
- **Task Assignments**: Email notifications when tasks are assigned
- **Status Changes**: Email notifications for important status updates

### Scheduled Notifications
- **Cron Jobs**: Automated notification scheduling using @nestjs/schedule
- **Deadline Approaching**: Notifications sent 24 hours before deadlines
- **Overdue Tasks**: Hourly checks for overdue tasks
- **Customizable Timing**: Configurable notification schedules
- **Batch Processing**: Efficient handling of multiple notifications

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
  createdAt: Date;
  updatedAt: Date;
}
```

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

---

## API Documentation

The API is documented using Swagger. Access the documentation at:
- Development: http://localhost:3000/api
- Production: https://your-domain.com/api

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

---

## Cron Jobs

The application includes scheduled tasks for automated notifications:

### Deadline Reminders
- **Schedule**: Every 6 hours
- **Purpose**: Send reminders for tasks with approaching deadlines
- **Target**: Task assignees and creators

### Overdue Task Alerts
- **Schedule**: Every hour
- **Purpose**: Send alerts for overdue tasks
- **Target**: Task assignees and creators

### Customization
Cron schedules can be modified in `src/modules/notifications/services/notification-cron.service.ts`

---

## Performance Optimization

### Database Indexes
```javascript
// Create indexes for notification queries
db.notifications.createIndex({ userId: 1, read: 1, timestamp: -1 });
db.notifications.createIndex({ taskId: 1, timestamp: -1 });
db.pushsubscriptions.createIndex({ userId: 1 });
```

### Caching
- Consider implementing Redis for WebSocket session management
- Cache frequently accessed notification data
- Implement notification batching for high-volume scenarios

### Rate Limiting
- Implement rate limiting for notification endpoints
- Limit WebSocket event frequency
- Monitor notification delivery rates

---

## Security Considerations

### WebSocket Security
- JWT authentication for all WebSocket connections
- User isolation through personal rooms
- Input validation for all WebSocket events
- Rate limiting for WebSocket events

### Push Notifications
- VAPID key security (keep private key secure)
- Subscription validation
- User permission verification
- Notification content sanitization

### Email Notifications
- SMTP authentication
- Email content validation
- Rate limiting for email sending
- Bounce handling and cleanup

---

## Monitoring and Logging

### WebSocket Monitoring
- Connection count tracking
- Event frequency monitoring
- Error rate tracking
- Performance metrics

### Notification Monitoring
- Delivery success rates
- Push notification failure tracking
- Email delivery monitoring
- Cron job execution logging

### Health Checks
- Database connectivity
- WebSocket server status
- Push notification service health
- Email service availability

---

## License

MIT