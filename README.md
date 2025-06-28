# Task Manager Application

A modern, full-stack task management application with **real-time collaboration** and **comprehensive notifications**. Built with React, NestJS, and MongoDB.

## 🚀 Key Features

### Core Task Management
- **User Authentication** with JWT and role-based access (Admin/User)
- **Task CRUD Operations** with assignment and approval workflows
- **Real-time Collaboration** via WebSocket integration
- **Comments & Attachments** with file upload support
- **Task Status Management** with custom workflows
- **Deadline Tracking** with automated reminders

### Real-Time Notifications
- **WebSocket Notifications** - Instant updates for task changes, assignments, and comments
- **Web Push Notifications** - Browser notifications even when app is closed
- **Email Notifications** - SMTP integration for important updates
- **Scheduled Notifications** - Automated deadline and overdue reminders

### Advanced Features
- **Admin Dashboard** with live monitoring and analytics
- **Excel Export** for reports and data analysis
- **Responsive UI** built with Tailwind CSS
- **State Management** with Redux Toolkit
- **File Management** with attachment support

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Socket.io Client** for real-time features
- **Tailwind CSS** for styling
- **React Router** for navigation

### Backend
- **NestJS** with TypeScript
- **MongoDB** with Mongoose ODM
- **Socket.io** for WebSocket implementation
- **JWT** for authentication
- **Nodemailer** for email notifications
- **Web Push** for browser notifications

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
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3001
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=http://localhost:3000
```

## 🌐 API Endpoints

- **Authentication**: `/auth/login`, `/auth/register`, `/auth/refresh`
- **Tasks**: `/tasks` (CRUD operations)
- **Users**: `/users` (user management)
- **Notifications**: `/notifications` (notification management)
- **Reports**: `/reports` (analytics and exports)
- **WebSocket**: Real-time updates and notifications

## 📱 Real-Time Features

### WebSocket Events
- **Task Updates**: Real-time task changes and status updates
- **Comments**: Live comment updates with mentions
- **Notifications**: Instant notification delivery
- **Admin Dashboard**: Live monitoring and statistics

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

## 📚 Documentation

- **Backend API**: Swagger docs at `/api`
- **WebSocket Events**: See backend README for detailed events
- **Frontend Components**: See frontend README for component documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React, NestJS, and MongoDB**