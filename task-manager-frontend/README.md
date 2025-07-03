# Task Manager Frontend

A modern React frontend with **real-time WebSocket integration**, **comprehensive notification system**, and **advanced task management** for the Task Manager application.

## 🚀 Key Features

### Core Task Management
- **User Authentication** with JWT and role-based access
- **Task CRUD Operations** with assignment workflows
- **Real-time Collaboration** via WebSocket integration
- **Comments & Attachments** with file upload support
- **Task Status Management** with custom workflows
- **Admin Dashboard** with live monitoring
- **Participant Management** with add/remove functionality

### Real-Time Features
- **WebSocket Notifications** - Instant updates for task changes
- **Live Task Updates** and status changes
- **Real-time Comments** with mentions
- **Admin Dashboard** with live statistics
- **User Activity Tracking** in real-time
- **Attachment Events** for file upload/delete notifications

### Notification System
- **In-App Notifications** - Real-time notification box with filtering
- **Web Push Notifications** - Browser notifications via service worker
- **Notification Management** - Mark as read, filtering, preferences
- **Toast Notifications** - User-friendly alerts
- **Priority-based Display** - Color-coded notification priorities
- **Bulk Operations** - Mark all as read, clear notifications

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
- **Headless UI** for accessible components

### Real-Time
- **WebSocket Context** for connection management
- **Service Worker** for push notifications
- **Custom Hooks** for WebSocket events
- **Real-time State Sync** with Redux

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
- **TaskList** - Display and manage tasks with filtering
- **TaskCard** - Individual task display with status
- **TaskDetails** - Detailed task view with comments and attachments
- **TaskForm** - Create and edit tasks with validation
- **NotificationBox** - Comprehensive notification management interface
- **AdminDashboard** - Admin monitoring and analytics
- **UserAvatar** - User profile display component

### Context Providers
- **AuthContext** - User authentication state management
- **WebSocketContext** - WebSocket connection management
- **NotificationContext** - Notification state management

### Custom Hooks
- **useTaskSocket** - Task-related WebSocket events
- **useNotificationSocket** - Notification WebSocket events
- **useCommentSocket** - Comment-related WebSocket events
- **useAttachmentSocket** - Attachment WebSocket events

## 📡 WebSocket Integration

### Connection Management
```typescript
// WebSocket connection setup
const { taskSocket, notificationSocket, isConnected } = useWebSocket();

// Subscribe to task updates
const { subscribeToTask } = useWebSocket();
subscribeToTask(taskId);
```

### Real-Time Events
- **Task Updates** - Live task changes and status updates
- **Comments** - Real-time comment updates with mentions
- **Notifications** - Instant notification delivery
- **Admin Dashboard** - Live monitoring and statistics
- **Attachments** - Real-time file upload and deletion events

## 🔔 Notification System

### In-App Notifications
- **NotificationBox** - Comprehensive notification interface
- **Real-time Updates** - Live notification count and status
- **Filtering & Search** - Find specific notifications by type
- **Mark as Read** - Individual and bulk operations
- **Priority Display** - Color-coded notification priorities
- **Clear Options** - Clear all, clear read, or specific notifications

### Web Push Notifications
- **Service Worker** - Background notification handling
- **Permission Management** - User-controlled preferences
- **Click Actions** - Navigate directly to tasks
- **Cross-platform** - Works on desktop and mobile
- **Custom Icons** - Task-specific notification icons

### Notification Types
- **Task Events** - Created, updated, deleted, assigned
- **Comment Events** - New comments, mentions
- **Attachment Events** - File uploads, deletions
- **Participant Events** - Added, removed
- **Deadline Events** - Approaching, overdue
- **System Events** - General notifications

## 📊 State Management

### Redux Store
- **Tasks Slice** - Task state management with filtering
- **Notification Slice** - Notification state with real-time updates
- **Stats Slice** - Analytics and statistics
- **Auth Slice** - Authentication state management

### WebSocket Integration
- **Real-time Updates** - Automatic state synchronization
- **Optimistic Updates** - Immediate UI feedback
- **Error Handling** - Graceful connection failures
- **Reconnection Logic** - Automatic reconnection on disconnect

## 🎨 UI/UX Features

### Responsive Design
- **Mobile-first** approach with Tailwind CSS
- **Responsive Components** - Works on all screen sizes
- **Touch-friendly** interface for mobile devices
- **Progressive Web App** features

### User Experience
- **Loading States** - Skeleton loaders and spinners
- **Error Boundaries** - Graceful error handling
- **Toast Notifications** - User feedback and alerts
- **Smooth Animations** - Enhanced user experience
- **Keyboard Navigation** - Accessible keyboard shortcuts
- **Dark Mode Support** - Theme switching capability

### Component Features
- **Task Cards** - Status indicators, priority badges, participant avatars
- **Task Details** - Rich text editor, file attachments, comment threads
- **Notification Box** - Tabbed interface, filtering, bulk actions
- **Admin Dashboard** - Real-time charts, user activity, task statistics

## 🔒 Security Features

- **JWT Authentication** with automatic token refresh
- **Protected Routes** - Role-based access control
- **WebSocket Authentication** - Secure real-time connections
- **Input Validation** - Client-side form validation
- **XSS Protection** - Sanitized content rendering
- **CSRF Protection** - Secure API requests

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

### Docker Deployment
```bash
docker build -t task-manager-frontend .
docker run -p 3001:3001 task-manager-frontend
```

## 📚 Component Documentation

### Task Components
- **TaskList** - Displays tasks with filtering, pagination, and sorting
- **TaskCard** - Individual task card with status, priority, and participant info
- **TaskDetails** - Detailed task view with comments, attachments, and real-time updates
- **TaskForm** - Form for creating and editing tasks with validation

### Notification Components
- **NotificationBox** - Main notification interface with filtering and bulk operations
- **NotificationToast** - Toast notifications for alerts and user feedback
- **NotificationContext** - Notification state management and WebSocket integration

### Admin Components
- **AdminDashboard** - Admin overview with real-time analytics and monitoring
- **AdminTasksDashboard** - Task management interface for administrators
- **Reports** - Analytics and reporting interface with data visualization

### UI Components
- **UserAvatar** - User profile display with fallback images
- **Sidebar** - Navigation sidebar with role-based menu items
- **Navbar** - Top navigation with notifications and user menu
- **Button** - Reusable button component with variants

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🔧 Development

### Project Structure
```
src/
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── Reports/       # Report components
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── pages/             # Page components
├── services/          # API services
├── store/             # Redux store
├── types/             # TypeScript types
└── shared/            # Shared utilities
```

### Key Features
- **TypeScript** - Full type safety
- **ESLint & Prettier** - Code quality and formatting
- **Husky** - Git hooks for code quality
- **Storybook** - Component documentation (optional)

## 🆘 Support

For issues and questions:
1. Check the [Issues](../../issues) page
2. Review the component documentation
3. Create a new issue with detailed information

---

**Built with ❤️ using React, Redux Toolkit, and Tailwind CSS**