# Task Manager Frontend

A modern React frontend with **real-time WebSocket integration**, **comprehensive notification system**, **advanced comment system**, and **workflow management** for the Task Manager application.

## 🚀 Key Features

### Core Task Management
- **User Authentication** with JWT and role-based access
- **Task CRUD Operations** with assignment workflows
- **Real-time Collaboration** via WebSocket integration
- **Advanced Comment System** with voting, replies, and mentions
- **File Attachments** with upload/download support
- **Task Status Management** with custom workflows
- **Admin Dashboard** with live monitoring
- **Participant Management** with add/remove functionality
- **Task Request System** with approval workflows

### Advanced Comment System
- **Threaded Comments** with parent-child relationships
- **Voting System** with up/down votes and vote counts
- **Comment Replies** with nested display
- **User Mentions** with notification system
- **Comment Editing** with inline form controls
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
- **In-App Notifications** - Real-time notification box with filtering
- **Web Push Notifications** - Browser notifications via service worker
- **Notification Management** - Mark as read, filtering, preferences
- **Toast Notifications** - User-friendly alerts
- **Priority-based Display** - Color-coded notification priorities
- **Bulk Operations** - Mark all as read, clear notifications
- **Comment Notifications** - Mentions, replies, and voting alerts
- **Task Notifications** - Assignments, status changes, and requests

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

### Utilities
- **Axios** for HTTP requests
- **Date-fns** for date manipulation
- **React Query** for data fetching
- **React Hot Toast** for notifications

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
- **CommentItem** - Individual comment with voting and replies
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
- **Comments** - Real-time comment updates with mentions, replies, and voting
- **Notifications** - Instant notification delivery
- **Admin Dashboard** - Live monitoring and statistics
- **Attachments** - Real-time file upload and deletion events
- **Participants** - Live participant management updates

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
- **Comment Events** - New comments, mentions, replies, voting
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
- **Comment System** - Voting buttons, reply threads, edit controls
- **Notification Box** - Tabbed interface, filtering, bulk actions
- **Admin Dashboard** - Real-time charts, user activity, task statistics

## 🔒 Security Features

- **JWT Authentication** with automatic token refresh
- **Protected Routes** - Role-based access control
- **WebSocket Authentication** - Secure real-time connections
- **Input Validation** - Client-side form validation
- **XSS Protection** - Sanitized content rendering
- **CSRF Protection** - Secure API requests

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── Reports/        # Report components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── pages/              # Page components
│   └── auth/           # Authentication pages
├── services/           # API services
├── shared/             # Shared utilities
│   └── interfaces/     # TypeScript interfaces
├── store/              # Redux store
├── types/              # TypeScript types
└── config/             # Configuration files
```

## 🧪 Testing

### Unit Tests
```bash
npm test
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
REACT_APP_BACKEND_URL=https://your-api-domain.com
```

## 📱 Progressive Web App

### Features
- **Service Worker** - Offline functionality
- **Push Notifications** - Browser notifications
- **App Manifest** - Installable app
- **Offline Support** - Basic offline functionality
- **Background Sync** - Sync when online

## 🔧 Development

### Code Style
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Conventional Commits** for commit messages

### Adding New Features
1. Create component in `src/components/`
2. Add types in `src/types/`
3. Update Redux store if needed
4. Add WebSocket events if real-time
5. Update tests and documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.