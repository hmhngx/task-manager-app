# Task Manager Frontend

A modern, feature-rich task management frontend built with React, TypeScript, Redux Toolkit, and Material-UI, featuring **real-time WebSocket integration** and **comprehensive notification system** for live collaboration.

---

## Features

- User authentication (login/register)
- Admin and user dashboards
- Create, read, update, and delete tasks
- Task assignment, request, and approval workflow
- Comments and file attachments on tasks
- Task status management (todo, in progress, done, late, etc.)
- **Real-time WebSocket integration**
- **Live task updates and notifications**
- **Real-time comments and mentions**
- **Admin dashboard with live monitoring**
- **Live activity feed**
- **Comprehensive notification system**
- **Web Push notifications**
- **Email notifications**
- **Scheduled notifications**
- **Notification preferences and management**
- **Notification box with filtering and search**
- Sidebar navigation (customizable)
- Responsive design
- Modern UI with Material-UI and Tailwind CSS
- State management with Redux Toolkit
- Excel export functionality
- Advanced reporting and data visualization

---

## Notification System

The application includes a comprehensive real-time notification system with multiple delivery channels:

### WebSocket Notifications
- **Live Task Updates**: All task changes are broadcast instantly to relevant users
- **Assignment & Mention Notifications**: Users receive immediate alerts for task assignments and when they are mentioned in comments
- **Task Request Alerts**: Admins are notified of new task requests, and users receive real-time updates on the status of their requests
- **Comment Notifications**: Real-time alerts when comments are added, edited, or deleted
- **Participant Changes**: Notifications when users are added to or removed from tasks

### Web Push Notifications
- **Browser Notifications**: Desktop notifications even when the app is closed
- **VAPID Protocol**: Secure push notification delivery
- **Service Worker Integration**: Background notification handling
- **Notification Actions**: Click to navigate directly to tasks
- **Permission Management**: User-controlled notification preferences
- **Subscription Management**: Automatic subscription handling

### Email Notifications
- **SMTP Integration**: Email delivery via backend
- **HTML Templates**: Rich email notifications with task details
- **Deadline Reminders**: Automated email reminders for upcoming deadlines
- **Overdue Alerts**: Email notifications for overdue tasks

### Notification Management
- **Notification Box**: Comprehensive notification interface with filtering
- **Mark as Read**: Individual and bulk mark-as-read functionality
- **Notification Preferences**: User-controlled notification settings
- **Real-time Updates**: Live notification count and status updates

---

## WebSocket Integration

### Architecture
```
src/
├── contexts/
│   ├── WebSocketContext.tsx     # Centralized WebSocket context
│   └── NotificationContext.tsx  # Notification-specific context
├── hooks/
│   ├── useTaskSocket.ts         # Task-specific WebSocket hook
│   ├── useCommentSocket.ts      # Comment-specific WebSocket hook
│   └── useNotificationSocket.ts # Notification WebSocket hook
├── components/
│   ├── NotificationBox.tsx      # Comprehensive notification interface
│   └── NotificationToast.tsx    # Real-time notification UI
├── services/
│   └── pushService.ts           # Push notification service
├── store/
│   └── notificationSlice.ts     # Notification state management
└── shared/
    └── interfaces/
        └── notification.interface.ts # TypeScript interfaces
```

### WebSocket Hooks

#### useTaskSocket Hook
```typescript
const { isConnected } = useTaskSocket({
  taskId: 'task-123', // Optional: subscribe to specific task
  onTaskUpdate: (task) => console.log('Task updated:', task),
  onTaskCreated: (task) => console.log('Task created:', task),
  onTaskDeleted: (taskId) => console.log('Task deleted:', taskId),
  onStatusChange: (taskId, oldStatus, newStatus) => 
    console.log(`Status changed: ${oldStatus} → ${newStatus}`),
  onAssignment: (taskId, assigneeId, assignerId) => 
    console.log(`Task assigned to ${assigneeId} by ${assignerId}`),
});
```

#### useNotificationSocket Hook
```typescript
const { notifications, unreadCount, markAsRead } = useNotificationSocket({
  onNotification: (notification) => console.log('New notification:', notification),
  onTaskAssigned: (task, assigner) => console.log('Task assigned:', task),
  onMention: (comment, taskId, author) => console.log('Mentioned in comment'),
});
```

#### useCommentSocket Hook
```typescript
const { comments, setComments } = useCommentSocket({
  taskId: 'task-123',
  onCommentAdded: (comment) => console.log('Comment added:', comment),
  onCommentEdited: (comment) => console.log('Comment edited:', comment),
  onCommentDeleted: (commentId) => console.log('Comment deleted:', commentId),
});
```

### Real-Time Features
- **Live Task Updates**: Status changes, assignments, and modifications broadcast instantly
- **Real-Time Comments**: New comments appear instantly with mention notifications
- **Live Notifications**: Task assignments, status changes, and deadline reminders
- **Admin Dashboard Monitoring**: Real-time user activity and system statistics
- **Live Activity Feed**: System-wide events and collaboration awareness
- **Notification Management**: Real-time notification count and status updates

---

## Push Notification Service

### Service Worker
The application includes a service worker (`public/service-worker.js`) that handles:
- Push notification reception
- Notification click handling
- Background sync capabilities
- Offline functionality

### Push Service Features
```typescript
// Initialize push notifications
await pushService.initializePushNotifications();

// Request notification permission
const hasPermission = await pushService.requestPermission();

// Subscribe to push notifications
const subscription = await pushService.subscribeToPushNotifications();

// Send subscription to backend
await pushService.sendSubscriptionToBackend(subscription);

// Unsubscribe from push notifications
await pushService.unsubscribeFromPushNotifications(endpoint);
```

### Notification Types
- **Task Created**: New task notifications
- **Task Assigned**: Assignment notifications
- **Task Status Changed**: Status update notifications
- **Task Request**: Request notifications (admin)
- **Task Request Response**: Approval/rejection notifications
- **Comment Added**: Comment notifications
- **Participant Added/Removed**: Participant change notifications
- **Deadline Approaching**: Deadline reminder notifications
- **Task Overdue**: Overdue task notifications

---

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)
- HTTPS in production (required for push notifications)

---

## Environment Setup

1. Create a `.env` file in the root directory:
   ```
   REACT_APP_BACKEND_URL=http://localhost:3000
   REACT_APP_ENV=development
   ```

2. Adjust `REACT_APP_BACKEND_URL` if your backend is running on a different port or host.

3. For production, ensure HTTPS is configured (required for push notifications).

---

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The application will be available at [http://localhost:3001](http://localhost:3001) (or as configured).

---

## Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── NotificationBox.tsx
│   ├── NotificationToast.tsx
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   └── TaskDetails.tsx
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   ├── WebSocketContext.tsx
│   └── NotificationContext.tsx
├── hooks/             # Custom hooks including WebSocket hooks
│   ├── useTaskSocket.ts
│   ├── useNotificationSocket.ts
│   └── useCommentSocket.ts
├── pages/             # Page components
├── services/          # API services
│   └── pushService.ts
├── store/             # Redux store configuration and slices
│   ├── index.ts
│   ├── tasksSlice.ts
│   ├── notificationSlice.ts
│   └── statsSlice.ts
├── types/             # TypeScript type definitions
├── shared/            # Shared interfaces and utilities
│   └── interfaces/
│       └── notification.interface.ts
└── utils/             # Utility functions
```

---

## Available Scripts

- `npm start` — Runs the app in development mode
- `npm test` — Launches the test runner
- `npm run build` — Builds the app for production
- `npm run eject` — Ejects from Create React App

---

## Key Technologies

- **React** with TypeScript for type safety
- **Redux Toolkit** for state management
- **Material-UI** for UI components
- **Tailwind CSS** for custom styling
- **React Router** for navigation
- **Axios** for API calls
- **Socket.IO client** for real-time WebSocket communication
- **Service Worker** for push notifications
- **Web Push API** for browser notifications
- **XLSX** for Excel export functionality
- **Day.js** for date handling

---

## WebSocket Configuration

### Connection Setup
```typescript
// WebSocket connection with authentication
const socket = io(`${backendUrl}/tasks`, {
  auth: { token: jwtToken },
  transports: ['websocket', 'polling'],
});
```

### Event Handling
The application handles various WebSocket events:
- Task events: creation, updates, deletion, assignment
- Comment events: addition, editing, deletion
- Notification events: assignments, mentions, reminders
- Admin events: user activity, system statistics

### Fallback Strategy
- WebSocket connection failures fall back to polling
- Existing REST API endpoints remain functional
- UI gracefully handles connection state changes
- Connection status indicators for user feedback

---

## Notification Components

### NotificationBox
A comprehensive notification interface that provides:
- **Filtering**: All notifications vs unread notifications
- **Search**: Search through notification content
- **Bulk Actions**: Mark all as read functionality
- **Real-time Updates**: Live notification count and status
- **Responsive Design**: Works on desktop and mobile

### NotificationToast
Real-time notification display that shows:
- **Instant Notifications**: Immediate display of new notifications
- **Priority Levels**: Visual indicators for notification priority
- **Action Buttons**: Quick actions for notifications
- **Auto-dismiss**: Automatic hiding after a set time

### Notification Context
Centralized notification management providing:
- **WebSocket Integration**: Real-time notification updates
- **State Management**: Notification state and actions
- **Connection Management**: WebSocket connection handling
- **Error Handling**: Graceful error handling and reconnection

---

## Redux Integration

### Notification Slice
```typescript
// Notification state management
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action) => {
      // Mark notification as read logic
    },
    markAllAsRead: (state) => {
      // Mark all notifications as read logic
    },
  },
});
```

### Async Thunks
- `fetchNotifications`: Load notifications from API
- `markNotificationAsRead`: Mark individual notification as read
- `markAllNotificationsAsRead`: Mark all notifications as read

---

## Customization

- **Sidebar:** You can easily add or remove navigation elements in `src/components/Sidebar.tsx`.
- **UI:** Styling is done with a combination of Material-UI and Tailwind CSS.
- **State Management:** Redux store configuration can be modified in `src/store/`.
- **WebSocket:** WebSocket context and hooks can be customized in `src/contexts/` and `src/hooks/`.
- **Notifications:** Notification components and logic can be customized in `src/components/` and `src/store/`.

---

## Browser Compatibility

### WebSocket Support
- Modern browsers with WebSocket support
- Fallback to polling for older browsers
- Graceful degradation for connection issues

### Push Notifications
- Chrome 42+
- Firefox 44+
- Safari 16+
- Edge 17+
- Requires HTTPS in production

### Service Worker
- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+

---

## Performance Optimization

### WebSocket Optimization
- Connection pooling and reuse
- Event debouncing for high-frequency updates
- Selective subscriptions to reduce unnecessary updates
- Memory leak prevention with proper cleanup

### Notification Optimization
- Lazy loading of notification history
- Pagination for large notification lists
- Efficient state updates with Redux
- Background sync for offline notifications

### Bundle Optimization
- Code splitting for better load times
- Tree shaking for unused code removal
- Service worker caching for static assets
- Optimized imports and dependencies

---

## Troubleshooting

### General Issues
- **Blank screen after update:** Check browser console for errors, ensure backend is running
- **API 500 errors:** Check backend logs for stack traces
- **React key warnings:** Ensure all `.map()` calls use unique keys
- **Redux state issues:** Use Redux DevTools to debug state updates and actions

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

## Production Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
Ensure all required environment variables are set:
- `REACT_APP_BACKEND_URL`: Backend API URL
- `REACT_APP_ENV`: Environment (development/production)

### HTTPS Requirements
- Web Push notifications require HTTPS in production
- Configure SSL certificates for the frontend
- Update service worker for production URLs

### Service Worker
- Ensure service worker is properly registered
- Test push notifications in production environment
- Monitor service worker updates and caching

---

## Security Considerations

### WebSocket Security
- JWT authentication for all WebSocket connections
- Input validation for all WebSocket events
- Rate limiting for WebSocket events
- Secure WebSocket URLs (WSS in production)

### Push Notifications
- VAPID key security (handled by backend)
- User permission verification
- Notification content sanitization
- Secure subscription management

### General Security
- HTTPS enforcement in production
- Content Security Policy (CSP) headers
- XSS prevention with proper sanitization
- CSRF protection for API calls

---

## License

MIT