# TaskFlow Backend

A robust NestJS backend with **real-time WebSocket integration**, **comprehensive notification system**, **advanced comment system**, **email authentication**, **AI-powered productivity assistance**, and **workflow management** for the TaskFlow application.

## 🚀 Key Features

### Core API
- **Email-based Authentication** with JWT and refresh tokens
- **Password Reset System** with email verification and secure tokens
- **Role-based Access Control** (Admin/User)
- **Task CRUD Operations** with assignment workflows
- **File Upload** and attachment management
- **Advanced Comment System** with voting, replies, and mentions
- **Reporting & Analytics** with Excel export
- **Participant Management** with add/remove functionality
- **Task Request System** with approval workflows
- **Admin Dashboards** with advanced analytics and real-time updates (API support)
- **Improved Notification System** with new types and real-time updates (API support)
- **Support for Enhanced Navigation and Landing Page** (API endpoints for user/session status)

### AI-Powered Productivity Assistant
- **OpenAI Integration** with GPT-3.5-turbo for intelligent task assistance
- **Context-Aware Suggestions** based on task details and user questions
- **Productivity Tips** with actionable recommendations
- **Time Management Advice** for task completion optimization
- **Best Practices Guidance** for different task types
- **Secure API Communication** with proper error handling
- **Connection Testing** for API key validation
- **Comprehensive Logging** for debugging and monitoring

### Authentication & Security
- **Email-based Login** with secure password hashing using bcrypt
- **Password Reset Flow** with time-limited tokens and email verification
- **JWT Authentication** with refresh token rotation
- **Session Management** with persistent login
- **Account Recovery** with secure email-based reset links
- **Input Validation** with comprehensive DTOs
- **Rate Limiting** and security headers

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
- **Email Notifications** - SMTP integration with templates
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

### Authentication & Email
- **bcrypt** for password hashing
- **Nodemailer** for email delivery
- **@nestjs-modules/mailer** for email templates
- **Handlebars** for email template rendering

### Notifications
- **Web Push** for browser notifications
- **@nestjs/schedule** for cron jobs
- **VAPID** for push notification keys

### Utilities
- **Swagger/OpenAPI** for API documentation
- **Class-validator** for input validation
- **Multer** for file uploads
- **ExcelJS** for report generation
- **Cron** for scheduled tasks
- **OpenAI API** for AI-powered assistance

## 📦 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- SMTP server (Gmail, SendGrid, etc.)
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
EMAIL_FROM_NAME=TaskFlow

# AI Assistant (OpenAI)
OPENAI_API_KEY=your_openai_api_key

# Application
PORT=3000
NODE_ENV=development
```

## 🌐 API Endpoints

### Authentication
- `POST /auth/login` - User login with email
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

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

### AI Assistant
- `POST /ai/assist` - Get AI assistance for task productivity
- `POST /ai/test` - Test OpenAI API connection

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

- **Email-based Authentication** with secure password hashing
- **JWT Authentication** with refresh tokens
- **Password Reset Security** with time-limited tokens
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
- Password reset tokens and expiry

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
- Storage path and access URLs
- Upload timestamp and user info
- Task and comment associations

### Refresh Tokens
- Token hash and expiry
- User association
- Revocation status
- Replacement token tracking

## 📧 Email System

### Email Service
The backend includes a comprehensive email service for:
- Welcome emails for new users
- Password reset links with secure tokens
- Task assignment notifications
- Deadline reminders
- System notifications

### Email Templates
Customizable Handlebars templates located in:
- `src/modules/auth/templates/welcome.hbs`
- `src/modules/auth/templates/password-reset.hbs`

### SMTP Configuration
Supports various SMTP providers:
- Gmail (with App Passwords)
- SendGrid
- AWS SES
- Custom SMTP servers

## 🔧 Development Scripts

### Authentication Scripts
```bash
# Create admin user with email
npm run create-admin

# Add email to existing admin user
npm run add-admin-email

# Migrate existing users to email authentication
npm run migrate:email-auth
```

### Database Scripts
```bash
# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed
```

### Development Scripts
```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```

## 📁 Project Structure

```
src/
├── config/              # Configuration files
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── email.config.ts
├── modules/             # Feature modules
│   ├── auth/           # Authentication module
│   │   ├── services/   # Email service
│   │   ├── templates/  # Email templates
│   │   ├── guards/     # Authentication guards
│   │   └── dto/        # Data transfer objects
│   ├── tasks/          # Task management
│   │   ├── services/   # Task services
│   │   ├── schemas/    # Database schemas
│   │   └── dto/        # Task DTOs
│   ├── users/          # User management
│   ├── reports/        # Reporting system
│   ├── ai/             # AI assistant module
│   │   ├── dto/        # AI request DTOs
│   │   └── services/   # AI service
│   └── websocket/      # WebSocket gateways
├── exceptions/          # Exception filters
└── main.ts             # Application entry point
```

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
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker Deployment
```bash
# Build image
docker build -t taskflow-backend .

# Run container
docker run -p 3000:3000 taskflow-backend
```

### Environment Setup
Ensure all environment variables are configured:
- Database connection
- JWT secrets
- SMTP settings
- VAPID keys
- Frontend URL for CORS

## 📚 API Documentation

### Swagger UI
Access API documentation at: `http://localhost:3000/api`

### Authentication Flow
1. **Login**: POST `/auth/login` with email/password
2. **Token Refresh**: POST `/auth/refresh` with refresh token
3. **Password Reset**: POST `/auth/forgot-password` → email → POST `/auth/reset-password`

### WebSocket Authentication
1. Connect to WebSocket with JWT token
2. Authenticate connection via `auth` event
3. Subscribe to specific channels

## 🔄 Recent Updates

### AI-Powered Productivity Assistant
- Implemented OpenAI integration with GPT-3.5-turbo
- Added context-aware task assistance and productivity tips
- Created comprehensive AI service with error handling
- Added connection testing for API key validation
- Included suggestion extraction and response parsing
- Added Swagger documentation for AI endpoints

### Email Authentication System
- Implemented email-based login and registration
- Added password reset functionality with secure tokens
- Enhanced JWT authentication with refresh tokens
- Added comprehensive email service with templates

### Security Enhancements
- Improved password hashing with bcrypt
- Added rate limiting and security headers
- Enhanced input validation with DTOs
- Implemented secure token management

### Backend Infrastructure
- Added email configuration and service
- Enhanced user management with profile features
- Improved error handling and logging
- Added development scripts for user management

### Admin Features
- Added API support for enhanced admin dashboards and analytics

### Notifications
- Improved notification system with new types and real-time updates

### Navigation & Layout
- Added endpoints to support new landing page and navigation improvements