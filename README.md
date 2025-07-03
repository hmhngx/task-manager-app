# Task Manager Application

A modern, full-stack task management application with **real-time collaboration**, **comprehensive notifications**, and **advanced workflow management**. Built with React, NestJS, and MongoDB.

## 🚀 Key Features

### Core Task Management
- **User Authentication** with JWT and role-based access (Admin/User)
- **Task CRUD Operations** with assignment and approval workflows
- **Real-time Collaboration** via WebSocket integration
- **Comments & Attachments** with file upload support
- **Task Status Management** with custom workflows
- **Deadline Tracking** with automated reminders
- **Participant Management** with add/remove functionality

### Real-Time Notifications
- **WebSocket Notifications** - Instant updates for task changes, assignments, and comments
- **Web Push Notifications** - Browser notifications even when app is closed
- **Email Notifications** - SMTP integration for important updates
- **Scheduled Notifications** - Automated deadline and overdue reminders
- **Notification Management** - Mark as read, filtering, and bulk operations

### Advanced Features
- **Admin Dashboard** with live monitoring and analytics
- **Excel Export** for reports and data analysis
- **Responsive UI** built with Tailwind CSS
- **State Management** with Redux Toolkit
- **File Management** with attachment support
- **Real-time Statistics** and activity tracking

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Socket.io Client** for real-time features
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form handling
- **React Datepicker** for date selection

### Backend
- **NestJS** with TypeScript
- **MongoDB** with Mongoose ODM
- **Socket.io** for WebSocket implementation
- **JWT** for authentication with refresh tokens
- **Nodemailer** for email notifications
- **Web Push** for browser notifications
- **Multer** for file uploads
- **ExcelJS** for report generation

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
- **Comments**: Live comment updates with mentions
- **Notifications**: Instant notification delivery
- **Admin Dashboard**: Live monitoring and statistics
- **Attachments**: Real-time file upload and deletion events

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

## 📊 Monitoring & Analytics

- **Real-time Statistics** on admin dashboard
- **User Activity Tracking** with WebSocket events
- **Notification Delivery Analytics**
- **Performance Monitoring** with logging
- **Error Tracking** and debugging tools

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

## 📚 Documentation

- **Backend API**: Swagger docs at `/api`
- **WebSocket Events**: See backend README for detailed events
- **Frontend Components**: See frontend README for component documentation

## 🧪 Testing

### Backend Testing
```bash
cd task-manager-backend
npm run test          # Unit tests
npm run test:e2e      # E2E tests
```

### Frontend Testing
```bash
cd task-manager-frontend
npm test              # Unit tests
npm run test:e2e      # E2E tests
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

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Review the documentation in the backend and frontend README files
3. Create a new issue with detailed information

---

**Built with ❤️ using React, NestJS, and MongoDB**