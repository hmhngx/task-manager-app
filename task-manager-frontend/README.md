# Task Manager Frontend

A modern React frontend with **real-time WebSocket integration** and **comprehensive notification system** for the Task Manager application.

## 🚀 Key Features

### Core Task Management
- **User Authentication** with JWT and role-based access
- **Task CRUD Operations** with assignment workflows
- **Real-time Collaboration** via WebSocket integration
- **Comments & Attachments** with file upload support
- **Task Status Management** with custom workflows
- **Admin Dashboard** with live monitoring

### Real-Time Features
- **WebSocket Notifications** - Instant updates for task changes
- **Live Task Updates** and status changes
- **Real-time Comments** with mentions
- **Admin Dashboard** with live statistics
- **User Activity Tracking** in real-time

### Notification System
- **In-App Notifications** - Real-time notification box
- **Web Push Notifications** - Browser notifications via service worker
- **Notification Management** - Mark as read, filtering, preferences
- **Toast Notifications** - User-friendly alerts

## 🛠️ Tech Stack

### Core
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Socket.IO Client** for WebSocket integration
- **React Router** for navigation

### UI & Styling
- **Tailwind CSS** for styling
- **React Icons** for icons
- **React Hook Form** for forms
- **React Datepicker** for date selection

### Real-Time
- **WebSocket Context** for connection management
- **Service Worker** for push notifications
- **Custom Hooks** for WebSocket events

## 📦 Quick Start

### Prerequisites
- Node.js (v16+)
- Backend server running

### Installation
```bash
npm install
cp .env.example .env
# Configure backend URL
npm start
```

## 🔧 Environment Variables

```bash
REACT_APP_BACKEND_URL=http://localhost:3000
REACT_APP_ENV=development
```

## 📱 Components Overview

### Core Components
- **TaskList** - Display and manage tasks
- **TaskCard** - Individual task display
- **TaskDetails** - Detailed task view with comments
- **TaskForm** - Create and edit tasks
- **NotificationBox** - Notification management interface
- **AdminDashboard** - Admin monitoring and analytics

### Context Providers
- **AuthContext** - User authentication state
- **WebSocketContext** - WebSocket connection management
- **NotificationContext** - Notification state management

### Custom Hooks
- **useTaskSocket** - Task-related WebSocket events
- **useNotificationSocket** - Notification WebSocket events
- **useCommentSocket** - Comment-related WebSocket events

## 📡 WebSocket Integration

### Connection Management
```typescript
// WebSocket connection setup
const { taskSocket, notificationSocket } = useWebSocket();

// Subscribe to task updates
const { subscribeToTask } = useWebSocket();
subscribeToTask(taskId);
```

### Real-Time Events
- **Task Updates** - Live task changes and status updates
- **Comments** - Real-time comment updates with mentions
- **Notifications** - Instant notification delivery
- **Admin Dashboard** - Live monitoring and statistics

## 🔔 Notification System

### In-App Notifications
- **NotificationBox** - Comprehensive notification interface
- **Real-time Updates** - Live notification count and status
- **Filtering & Search** - Find specific notifications
- **Mark as Read** - Individual and bulk operations

### Web Push Notifications
- **Service Worker** - Background notification handling
- **Permission Management** - User-controlled preferences
- **Click Actions** - Navigate directly to tasks
- **Cross-platform** - Works on desktop and mobile

## 📊 State Management

### Redux Store
- **Tasks Slice** - Task state management
- **Notification Slice** - Notification state
- **Stats Slice** - Analytics and statistics
- **Auth Slice** - Authentication state

### WebSocket Integration
- **Real-time Updates** - Automatic state synchronization
- **Optimistic Updates** - Immediate UI feedback
- **Error Handling** - Graceful connection failures
- **Reconnection Logic** - Automatic reconnection

## 🎨 UI/UX Features

### Responsive Design
- **Mobile-first** approach with Tailwind CSS
- **Responsive Components** - Works on all screen sizes
- **Touch-friendly** interface for mobile devices

### User Experience
- **Loading States** - Skeleton loaders and spinners
- **Error Boundaries** - Graceful error handling
- **Toast Notifications** - User feedback and alerts
- **Smooth Animations** - Enhanced user experience

## 🔒 Security Features

- **JWT Authentication** with automatic token refresh
- **Protected Routes** - Role-based access control
- **WebSocket Authentication** - Secure real-time connections
- **Input Validation** - Client-side form validation

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Environment Setup
```bash
# Development
REACT_APP_BACKEND_URL=http://localhost:3000

# Production
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

## 📚 Component Documentation

### Task Components
- **TaskList** - Displays tasks with filtering and pagination
- **TaskCard** - Individual task card with status and actions
- **TaskDetails** - Detailed task view with comments and attachments
- **TaskForm** - Form for creating and editing tasks

### Notification Components
- **NotificationBox** - Main notification interface
- **NotificationToast** - Toast notifications for alerts
- **NotificationContext** - Notification state management

### Admin Components
- **AdminDashboard** - Admin overview and analytics
- **AdminTasksDashboard** - Task management for admins
- **Reports** - Analytics and reporting interface

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Build for production
npm run build
```

## 📱 Browser Support

- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (latest)
- **Edge** (latest)
- **Mobile browsers** (iOS Safari, Chrome Mobile)

---

**Built with React, Redux Toolkit, and Socket.IO**