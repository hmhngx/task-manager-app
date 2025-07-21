# TaskFlow Frontend

A modern React frontend with **real-time WebSocket integration**, **comprehensive notification system**, **advanced comment system**, **email authentication**, **AI-powered productivity assistance**, and **workflow management** for the TaskFlow application.

## 🚀 Key Features

### Core Task Management
- **Email-based Authentication** with JWT and role-based access
- **Password Reset System** with email verification
- **Task CRUD Operations** with assignment workflows
- **Real-time Collaboration** via WebSocket integration
- **Advanced Comment System** with voting, replies, and mentions
- **File Attachments** with upload/download support
- **Task Status Management** with custom workflows
- **Admin Dashboard** with live monitoring
- **Participant Management** with add/remove functionality
- **Task Request System** with approval workflows
- **Landing Page** for first-time and unauthenticated users
- **Enhanced Navigation** with improved sidebar and navbar
- **Admin Dashboards** with advanced analytics and real-time updates
- **Improved Authentication Flow** with robust session and route protection
- **Upgraded Notification System** with new types and real-time updates

### AI-Powered Productivity Assistant
- **OpenAI Integration** with GPT-3.5-turbo for intelligent task assistance
- **Context-Aware Suggestions** based on task details and user questions
- **Productivity Tips** with actionable recommendations
- **Time Management Advice** for task completion optimization
- **Best Practices Guidance** for different task types
- **Real-time AI Responses** with numbered suggestion lists
- **Modern UI Design** with gradient styling and smooth animations
- **Comprehensive Error Handling** with user-friendly feedback
- **Loading States** with animated spinners and progress indicators
- **Responsive Design** optimized for all device sizes

### Authentication & User Experience
- **Email-based Login** with secure authentication
- **Password Reset Flow** with email verification
- **Modern UI Components** with floating inputs and gradient buttons
- **Responsive Design** with mobile-first approach
- **Loading States** and error handling
- **Session Management** with persistent login
- **Account Recovery** with email-based reset

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

### Authentication & Forms
- **Custom UI Components** - Floating inputs, gradient buttons
- **Form Validation** with comprehensive error handling
- **Email Authentication** with secure token management
- **Password Reset Flow** with user-friendly interface

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
- **OpenAI API** for AI-powered assistance

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
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENV=development
```

## 📱 Components Overview

### Navigation & Layout
- **LandingPage** - Welcome and onboarding for new/unauthenticated users
- **Navbar** - Top navigation bar with improved accessibility
- **Sidebar** - Responsive sidebar for main navigation

### Admin Features
- **AdminDashboard** - Enhanced analytics and user management
- **AdminTasksDashboard** - Advanced task analytics and filtering

### Authentication
- **AuthContext** - Improved session and token management
- **Login** - Updated login page with better validation
- **Register** - Enhanced registration with feedback
- **PrivateRoute** - Robust route protection for authenticated users

### Task Management
- **TaskDetails** - Improved task detail view
- **TaskForm** - Enhanced task creation/editing
- **TaskDetailsPage** - Refined task page layout
- **taskService** - Updated for new endpoints and error handling

### Notifications
- **NotificationBox** - Improved notification UI and logic
- **NotificationItem** - Enhanced notification display

### UI Components
- **FloatingInput** - Modern input field with floating labels
- **GradientButton** - Gradient-styled buttons with loading states
- **AestheticSelect** - Enhanced select dropdown component
- **UserAvatar** - User profile display component

### Core Components
- **TaskList** - Display and manage tasks with filtering
- **TaskCard** - Individual task display with status
- **TaskDetails** - Detailed task view with comments and attachments
- **TaskForm** - Create and edit tasks with validation
- **TaskAI** - AI-powered productivity assistant with OpenAI integration
- **CommentItem** - Individual comment with voting and replies
- **NotificationBox** - Comprehensive notification management interface
- **AdminDashboard** - Admin monitoring and analytics

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

### Modern Design System
- **Floating Inputs** - Elegant form inputs with floating labels
- **Gradient Buttons** - Beautiful gradient-styled buttons
- **Responsive Layout** - Mobile-first design approach
- **Smooth Animations** - Enhanced user experience
- **Loading States** - Skeleton loaders and spinners
- **Error Boundaries** - Graceful error handling

### User Experience
- **Email Authentication** - Secure and user-friendly login
- **Password Reset** - Intuitive password recovery flow
- **Toast Notifications** - User feedback and alerts
- **Keyboard Navigation** - Accessible keyboard shortcuts
- **Touch-friendly** interface for mobile devices
- **Progressive Web App** features

### Component Features
- **Task Cards** - Status indicators, priority badges, participant avatars
- **Task Details** - Rich text editor, file attachments, comment threads
- **Comment System** - Voting buttons, reply threads, edit controls
- **Notification Box** - Tabbed interface, filtering, bulk actions
- **Admin Dashboard** - Real-time charts, user activity, task statistics

## 🔒 Security Features

- **Email-based Authentication** with secure token management
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
│   ├── auth/           # Authentication components
│   ├── ui/             # Reusable UI components
│   └── Reports/        # Report components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── pages/              # Page components
│   └── auth/           # Authentication pages
├── services/           # API services
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

### Docker Deployment
```bash
# Build image
docker build -t taskflow-frontend .

# Run container
docker run -p 3001:3001 taskflow-frontend
```

## 📱 Authentication Flow

### Login Process
1. User enters email and password
2. Form validation and submission
3. JWT token storage in localStorage
4. Automatic redirect to dashboard

### Password Reset
1. User requests password reset
2. Email sent with secure token
3. User clicks link and enters new password
4. Password updated and user logged in

### Session Management
- Automatic token refresh
- Persistent login across browser sessions
- Secure logout with token cleanup

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradient (#8B5CF6 to #7C3AED)
- **Secondary**: Gray tones (#6B7280 to #374151)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Yellow (#F59E0B)

### Typography
- **Headings**: Inter font family
- **Body**: System font stack
- **Code**: Monospace font

### Spacing
- Consistent spacing scale using Tailwind CSS
- Responsive padding and margins
- Component-specific spacing rules

## 🔄 Recent Updates

### Navigation & Layout
- Added new LandingPage for onboarding and unauthenticated users
- Improved Navbar and Sidebar for better navigation and accessibility

### Admin Features
- Enhanced AdminDashboard and AdminTasksDashboard with new analytics and real-time updates

### Authentication
- Refactored AuthContext for better session management
- Updated Login and Register pages for improved validation and feedback
- Improved PrivateRoute for robust route protection

### Task Management
- Refined TaskDetails, TaskForm, and TaskDetailsPage for better UX
- Updated taskService for new API endpoints

### Notifications
- Improved NotificationBox and NotificationItem for better user experience
- Added new notification types and real-time updates

### Component Library
- Added FloatingInput component with floating labels
- Created GradientButton component with loading states
- Enhanced AestheticSelect component
- Improved UserAvatar component
- Added TaskAI component with OpenAI integration

### Frontend Infrastructure
- Enhanced authentication service with email support
- Improved error handling and user feedback
- Better state management with Redux
- Enhanced WebSocket integration
- Added AI service for OpenAI communication