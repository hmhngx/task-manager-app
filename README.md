# Task Manager Application

A modern, full-stack task management application with **real-time collaboration**, **comprehensive notifications**, **advanced comment system**, and **workflow management**. Built with React, NestJS, and MongoDB.

## 🚀 Key Features

### Core Task Management
- **User Authentication** with JWT and role-based access (Admin/User)
- **Task CRUD Operations** with assignment and approval workflows
- **Real-time Collaboration** via WebSocket integration
- **Advanced Comment System** with voting, replies, and mentions
- **File Attachments** with upload/download support
- **Task Status Management** with custom workflows
- **Deadline Tracking** with automated reminders
- **Participant Management** with add/remove functionality
- **Task Request System** with approval workflows

### Advanced Comment System
- **Threaded Comments** with parent-child relationships
- **Voting System** with up/down votes and vote counts
- **Comment Replies** with nested display
- **User Mentions** with notification system
- **Comment Editing** with edit history tracking
- **Real-time Updates** via WebSocket
- **Attachment Support** for comments
- **Moderation Tools** for admins

### Real-Time Features
- **WebSocket Integration** for live updates across all features
- **Real-time Comments** with instant updates and notifications
- **Live Task Updates** and status changes
- **Admin Dashboard** with live monitoring and analytics
- **User Activity Tracking** in real-time
- **Attachment Events** for file upload/delete notifications
- **Participant Management** with live updates

### Comprehensive Notification System
- **WebSocket Notifications** - Instant updates for all activities
- **Web Push Notifications** - Browser notifications even when app is closed
- **Email Notifications** - SMTP integration for important updates
- **Scheduled Notifications** - Automated deadline and overdue reminders
- **Comment Notifications** - Mentions, replies, and voting alerts
- **Task Notifications** - Assignments, status changes, and requests
- **Notification Management** - Mark as read, filtering, and bulk operations
- **Priority-based Notifications** - Urgent, high, medium, low priorities

### Advanced Features
- **Admin Dashboard** with live monitoring and analytics
- **Excel Export** for reports and data analysis
- **Responsive UI** built with Tailwind CSS
- **State Management** with Redux Toolkit
- **File Management** with attachment support
- **Real-time Statistics** and activity tracking
- **Workflow Management** with custom transitions
- **User Management** with role-based permissions

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Socket.io Client** for real-time features
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form handling
- **React Datepicker** for date selection
- **React Icons** for iconography

### Backend
- **NestJS** with TypeScript
- **MongoDB** with Mongoose ODM
- **Socket.IO** for WebSocket implementation
- **JWT** for authentication with refresh tokens
- **Nodemailer** for email notifications
- **Web Push** for browser notifications
- **Multer** for file uploads
- **ExcelJS** for report generation
- **Cron** for scheduled tasks

## 📦 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- SMTP server (for emails)
- VAPID keys (for push notifications)

### Backend Setup
```bash
cd task-manager-backend
npm install
cp .env.example .env  # Configure environment variables
npm run start:dev
```

### Frontend Setup
```bash
cd task-manager-frontend
npm install
cp .env.example .env  # Configure backend URL
npm start
```

## 🔧 Environment Variables

### Backend (.env)
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

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=http://localhost:3000
REACT_APP_ENV=development
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

### Push Notifications
- `GET /auth/push/vapid-public-key` - Get VAPID key
- `POST /auth/push/subscribe` - Subscribe to push
- `DELETE /auth/push/unsubscribe` - Unsubscribe

### Reports
- `GET /reports/tasks` - Task analytics
- `GET /reports/users` - User activity
- `GET /reports/export` - Excel export

## 📱 Real-Time Features

### WebSocket Events
- **Task Updates**: Real-time task changes and status updates
- **Comments**: Live comment updates with mentions, replies, and voting
- **Notifications**: Instant notification delivery
- **Admin Dashboard**: Live monitoring and statistics
- **Attachments**: Real-time file upload and deletion events
- **Participants**: Live participant management updates

### Notification Channels
- **In-App**: Real-time notifications in the UI
- **Browser Push**: Desktop notifications via service worker
- **Email**: SMTP-based email notifications
- **Scheduled**: Automated deadline and overdue reminders

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (Admin/User)
- **WebSocket Authentication** with JWT validation
- **CORS Configuration** for secure cross-origin requests
- **Input Validation** and sanitization
- **Rate Limiting** and security headers
- **File Upload Security** with type and size validation

## 📊 Monitoring & Analytics

- **Real-time Statistics** on admin dashboard
- **User Activity Tracking** with WebSocket events
- **Notification Delivery Analytics**
- **Performance Monitoring** with logging
- **Error Tracking** and debugging tools
- **Comment Analytics** with voting statistics

## 🚀 Deployment

### Backend Deployment
```bash
npm run build
npm run start:prod
```

### Frontend Deployment
```bash
npm run build
# Deploy build folder to your hosting service
```

### Docker Deployment
```bash
# Backend
docker build -t task-manager-backend ./task-manager-backend
docker run -p 3000:3000 task-manager-backend

# Frontend
docker build -t task-manager-frontend ./task-manager-frontend
docker run -p 3001:3001 task-manager-frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@taskmanager.com or join our Slack channel.

## 🔄 Version History

- **v2.0.0** - Advanced comment system with voting and replies
- **v1.5.0** - Real-time notifications and WebSocket integration
- **v1.0.0** - Initial release with basic task management