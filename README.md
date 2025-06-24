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

### Core Task Management
- User authentication (JWT) with refresh tokens
- Admin and user roles with role-based access control
- Create, read, update, delete (CRUD) tasks
- Task assignment and approval workflow
- Task request/approval/rejection by admin
- Comments and file attachments on tasks
- Task status management (todo, in progress, done, late, etc.)
- Task workflows with custom transitions
- Task watchers and requesters
- Subtask support and parent-child relationships
- Task labels and priority levels
- Deadline management and progress tracking

### Real-Time Collaboration
- **Real-time collaboration via WebSocket integration**
- **Live task updates and notifications**
- **Real-time comments and mentions**
- **Admin dashboard with live monitoring**
- **Live activity feed**
- **Real-time task statistics and reporting**
- **Live user presence and activity tracking**

### Comprehensive Notification System
- **Multi-channel notification delivery**
- **Web Push notifications with VAPID protocol**
- **Email notifications via SMTP**
- **Scheduled notifications (deadlines, overdue)**
- **Notification preferences and management**
- **Notification filtering and search**
- **Mark as read functionality (individual and bulk)**
- **Notification templates and customization**
- **Notification delivery tracking and analytics**

### Advanced Features
- Dashboard and reporting with data visualization
- Excel export functionality
- Advanced filtering and pagination
- File upload and attachment management
- User management and profile settings
- Audit trails and activity logging
- Performance monitoring and optimization
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
- **Status Change Notifications**: Real-time alerts for task status transitions
- **Deadline Notifications**: Immediate alerts for deadline changes

### Web Push Notifications
- **Browser Notifications**: Desktop notifications even when the app is closed
- **VAPID Protocol**: Secure push notification delivery
- **Service Worker Integration**: Background notification handling
- **Notification Actions**: Click to navigate directly to tasks
- **Permission Management**: User-controlled notification preferences
- **Subscription Management**: Automatic subscription handling
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

### Notification Management
- **Notification Box**: Comprehensive notification interface with filtering
- **Real-time Updates**: Live notification count and status updates
- **Notification Preferences**: User-controlled notification settings
- **Notification History**: Persistent notification storage
- **Notification Analytics**: Delivery success rates and user engagement

---

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- SMTP server (for email notifications)
- VAPID keys (for push notifications)
- HTTPS in production (required for push notifications)

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

# Application Settings
PORT=3000
NODE_ENV=development
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
- **React 18** with TypeScript for type safety
- **Redux Toolkit** for state management with RTK Query
- **Tailwind CSS** for utility-first styling
- **React Router v6** for navigation and routing
- **Axios** for HTTP client and API calls
- **Socket.IO client** for real-time WebSocket communication
- **Service Worker** for push notifications and offline support
- **Web Push API** for browser notifications
- **React Hook Form** for form management
- **React Query** for server state management
- **XLSX** for Excel export functionality
- **Day.js** for date handling and formatting
- **React Hot Toast** for user notifications
- **React Icons** for icon library

### Backend
- **NestJS** with TypeScript for scalable server-side applications
- **MongoDB** with Mongoose ODM for database management
- **JWT** for stateless authentication
- **Passport.js** for authentication strategies
- **Socket.IO** for real-time WebSocket functionality
- **Web Push** for push notification delivery
- **Nodemailer** for email notification delivery
- **@nestjs/schedule** for cron job scheduling
- **Swagger/OpenAPI** for API documentation
- **Class-validator** for input validation and DTOs
- **Class-transformer** for object transformation
- **Winston** for logging and monitoring
- **Helmet** for security headers
- **Compression** for response compression
- **Multer** for file upload handling
- **Sharp** for image processing
- **ExcelJS** for Excel file generation
- **Date-fns** for date manipulation
- **Bcrypt** for password hashing
- **UUID** for unique identifier generation

### Development Tools
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **Jest** for testing framework
- **Supertest** for API testing
- **TypeScript** for type safety
- **Webpack** for module bundling
- **Babel** for JavaScript compilation

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
├── websocket/
│   ├── gateways/
│   │   ├── task.gateway.ts
│   │   ├── notification.gateway.ts
│   │   └── admin.gateway.ts
│   ├── services/
│   │   └── websocket.service.ts
│   └── guards/
│       └── websocket-auth.guard.ts
└── shared/
    └── interfaces/
        ├── notification.interface.ts
        └── websocket.interface.ts
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
├── pages/
│   └── TaskDetailsPage.tsx
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
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and invalidate tokens
- `POST /auth/register/admin` - Register admin user (admin only)

### Push Notifications
- `GET /auth/push/vapid-public-key` - Get VAPID public key
- `POST /auth/push/subscribe` - Subscribe to push notifications
- `GET /auth/push/subscriptions` - Get user subscriptions
- `DELETE /auth/push/unsubscribe/:endpoint` - Unsubscribe from push notifications
- `DELETE /auth/push/subscriptions` - Deactivate all subscriptions

### Tasks
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get specific task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/request` - Request task assignment
- `POST /tasks/:id/approve` - Approve task request (admin)
- `POST /tasks/:id/reject` - Reject task request (admin)
- `POST /tasks/:id/participants` - Add participant (admin)
- `DELETE /tasks/:id/participants/:participantId` - Remove participant (admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications` - Clear all notifications

### Comments
- `POST /tasks/:id/comments` - Add comment to task
- `PUT /tasks/:id/comments/:commentId` - Update comment
- `DELETE /tasks/:id/comments/:commentId` - Delete comment

### Attachments
- `POST /tasks/:id/attachments` - Upload attachment
- `DELETE /tasks/:id/attachments/:attachmentId` - Delete attachment

### Reports
- `GET /reports/tasks` - Get task reports
- `GET /tasks/stats` - Get task statistics
- `GET /tasks/stats/weekly` - Get weekly statistics
- `GET /tasks/stats/weekly/detailed` - Get detailed weekly statistics

---

## WebSocket Events

### Client to Server
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

### Server to Client
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

### Schema Features
- **Indexing** - Optimized queries for performance
- **Validation** - Data integrity and type safety
- **Relationships** - Proper references between collections
- **Audit Trails** - Timestamps and change tracking
- **Soft Deletes** - Data preservation and recovery

---

## Security Features

### Authentication & Authorization
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (RBAC)
- **Password hashing** with bcrypt
- **Token blacklisting** for logout
- **Session management** and timeout

### WebSocket Security
- **JWT authentication** for WebSocket connections
- **User isolation** through personal rooms
- **Input validation** for all WebSocket events
- **Rate limiting** for WebSocket events

### Push Notifications
- **VAPID key security** (keep private key secure)
- **Subscription validation** and verification
- **User permission verification**
- **Notification content sanitization**

### General Security
- **HTTPS enforcement** in production
- **CORS configuration** for cross-origin requests
- **Input validation** and sanitization
- **SQL injection prevention** (MongoDB)
- **XSS prevention** with proper sanitization
- **CSRF protection** for API calls
- **Rate limiting** for API endpoints
- **Security headers** with Helmet

---

## Performance Optimization

### Backend Optimization
- **Database indexing** for frequent queries
- **Connection pooling** for MongoDB
- **Caching strategies** for static data
- **Compression** for API responses
- **Rate limiting** for API protection
- **Background job processing** for heavy operations

### Frontend Optimization
- **Code splitting** for better load times
- **Lazy loading** for components and routes
- **Service worker caching** for static assets
- **Image optimization** and compression
- **Bundle optimization** with tree shaking
- **Memory leak prevention** with proper cleanup

### WebSocket Optimization
- **Connection pooling** and reuse
- **Event debouncing** for high-frequency updates
- **Selective subscriptions** to reduce unnecessary updates
- **Memory management** and cleanup

### Notification Optimization
- **Batch processing** for multiple notifications
- **Delivery optimization** with priority queuing
- **Retry logic** for failed deliveries
- **Performance monitoring** and metrics

---

## Monitoring & Logging

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

### Notification Monitoring
- **Delivery success rates**
- **Push notification failure tracking**
- **Email delivery monitoring**
- **Cron job execution logging**

### Database Monitoring
- **Query performance tracking**
- **Connection pool monitoring**
- **Index usage statistics**
- **Storage and memory usage**

---

## Testing

### Backend Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Test notifications
node test-notifications.js
```

### Frontend Testing
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Test Coverage
- **Unit tests** for individual components and services
- **Integration tests** for API endpoints
- **E2E tests** for user workflows
- **WebSocket tests** for real-time functionality
- **Notification tests** for delivery systems

---

## Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- Database connection strings
- JWT secrets and VAPID keys
- SMTP configuration for email notifications
- CORS origins for security
- Application settings and ports

### Production Requirements
- **HTTPS** for Web Push notifications
- **SSL certificates** for secure communication
- **Environment-specific configurations**
- **Database backups** and monitoring
- **Log aggregation** and monitoring
- **Performance monitoring** and alerting

### Deployment Options
- **Docker containers** for easy deployment
- **Cloud platforms** (AWS, Azure, GCP)
- **VPS deployment** with PM2
- **Serverless deployment** (Vercel, Netlify)

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

### Browser-Specific Issues
- **Safari push notifications:** Ensure proper VAPID configuration
- **Firefox service worker:** Check service worker registration
- **Chrome notifications:** Verify notification permissions
- **Mobile browser support:** Test on various mobile browsers

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

## Roadmap

### Planned Features
- **Mobile app** development (React Native)
- **Advanced analytics** and reporting
- **Team collaboration** features
- **Calendar integration** and scheduling
- **Advanced workflow** automation
- **Multi-language** support
- **Dark mode** and theme customization
- **Advanced search** and filtering
- **API rate limiting** and quotas
- **Webhook integration** for external services