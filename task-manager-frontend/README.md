# Task Manager Frontend

A modern React frontend for the Task Manager app, built with TypeScript, Redux Toolkit, and Tailwind CSS. Features **real-time WebSocket integration**, **comprehensive notification system**, and **responsive design** for optimal user experience.

---

## Features

### Core Task Management
- User authentication with JWT and refresh tokens
- Admin and user roles with role-based access control
- Create, read, update, delete (CRUD) tasks
- Task assignment and approval workflow
- Task request/approval/rejection interface
- Comments and file attachments on tasks
- Task status management (todo, in progress, done, late, etc.)
- Task workflows with custom transitions
- Task watchers and requesters
- Subtask support and parent-child relationships
- Task labels and priority levels
- Deadline management and progress tracking

### Real-Time Collaboration
- **Real-time WebSocket integration** for live updates
- **Live task updates and notifications**
- **Real-time comments and mentions**
- **Admin dashboard with live monitoring**
- **Live activity feed**
- **Real-time task statistics and reporting**
- **Live user presence and activity tracking**
- **Real-time notification count updates**

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
- **Notification Box with comprehensive interface**
- **Real-time notification updates**

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

## Tech Stack

### Core Framework
- **React 18** with TypeScript for type safety and modern React features
- **React Router v6** for navigation and routing
- **Redux Toolkit** for state management with RTK Query
- **TypeScript** for type safety and better development experience

### UI & Styling
- **Tailwind CSS** for utility-first styling
- **React Icons** for comprehensive icon library
- **React Hot Toast** for user notifications
- **React Hook Form** for form management
- **React Query** for server state management
- **React Datepicker** for date selection

### Real-Time Communication
- **Socket.IO client** for real-time WebSocket communication
- **Service Worker** for push notifications and offline support
- **Web Push API** for browser notifications
- **WebSocket Context** for connection management

### Data & API
- **Axios** for HTTP client and API calls
- **XLSX** for Excel export functionality
- **Day.js** for date handling and formatting
- **React Query** for caching and synchronization

### Development Tools
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Webpack** for module bundling
- **Babel** for JavaScript compilation

---

## Notification System

The frontend includes a comprehensive real-time notification system with multiple delivery channels.

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

### Notification Management
- **Notification Box**: Comprehensive notification interface with filtering
- **Real-time Updates**: Live notification count and status updates
- **Notification Preferences**: User-controlled notification settings
- **Notification History**: Persistent notification storage
- **Notification Analytics**: Delivery success rates and user engagement

### WebSocket Events

#### Client to Server
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

#### Server to Client
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

## Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd task-manager-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   REACT_APP_BACKEND_URL=http://localhost:3000
   REACT_APP_ENV=development
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

---

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components
│   │   └── Button.tsx
│   ├── AdminDashboard.tsx
│   ├── AdminTasksDashboard.tsx
│   ├── Navbar.tsx
│   ├── NotificationBox.tsx
│   ├── NotificationToast.tsx
│   ├── PrivateRoute.tsx
│   ├── Reports/
│   │   └── ReportScreen.tsx
│   ├── Sidebar.tsx
│   ├── StatsPanel.tsx
│   ├── TaskCard.tsx
│   ├── TaskDetails.tsx
│   ├── TaskForm.tsx
│   ├── TaskList.tsx
│   └── UserAvatar.tsx
├── contexts/            # React contexts for state management
│   ├── AuthContext.tsx
│   ├── NotificationContext.tsx
│   └── WebSocketContext.tsx
├── hooks/               # Custom React hooks
│   ├── useCommentSocket.ts
│   ├── useNotificationSocket.ts
│   └── useTaskSocket.ts
├── pages/               # Page components
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Dashboard.tsx
│   ├── TaskDetailsPage.tsx
│   └── TaskListPage.tsx
├── services/            # API and external services
│   ├── authService.ts
│   ├── pushService.ts
│   ├── taskService.ts
│   └── userService.ts
├── store/               # Redux store and slices
│   ├── index.ts
│   ├── notificationSlice.ts
│   ├── statsSlice.ts
│   └── tasksSlice.ts
├── shared/              # Shared utilities and interfaces
│   └── interfaces/
│       └── notification.interface.ts
├── types/               # TypeScript type definitions
│   ├── index.d.ts
│   ├── index.ts
│   ├── react-datepicker.d.ts
│   ├── Task.ts
│   └── user.ts
├── config/              # Configuration files
│   └── api.config.ts
├── App.tsx              # Main App component
├── Auth.tsx             # Authentication wrapper
└── index.tsx            # Application entry point
```

---

## Key Components

### Authentication
- **AuthContext**: Manages authentication state and user information
- **Login/Register**: User authentication forms with validation
- **PrivateRoute**: Route protection for authenticated users
- **JWT Token Management**: Automatic token refresh and storage

### Task Management
- **TaskList**: Displays all tasks with filtering and pagination
- **TaskCard**: Individual task display with status and actions
- **TaskForm**: Create and edit task forms with validation
- **TaskDetails**: Detailed task view with comments and attachments
- **TaskDetailsPage**: Full-page task details with real-time updates

### Notifications
- **NotificationBox**: Comprehensive notification interface
- **NotificationToast**: Toast notifications for immediate feedback
- **NotificationContext**: Manages notification state and WebSocket connection
- **Push Service**: Handles Web Push notification subscriptions

### Real-Time Features
- **WebSocketContext**: Manages WebSocket connections and events
- **useTaskSocket**: Custom hook for task-related WebSocket events
- **useNotificationSocket**: Custom hook for notification WebSocket events
- **useCommentSocket**: Custom hook for comment-related WebSocket events

### Admin Features
- **AdminDashboard**: Admin overview with statistics and monitoring
- **AdminTasksDashboard**: Admin task management interface
- **StatsPanel**: Real-time statistics display
- **ReportScreen**: Comprehensive reporting interface

### UI Components
- **Navbar**: Navigation bar with user menu and notifications
- **Sidebar**: Side navigation for different sections
- **Button**: Reusable button component with variants
- **UserAvatar**: User avatar display component

---

## State Management

### Redux Store Structure
```typescript
interface RootState {
  auth: AuthState;
  tasks: TasksState;
  notifications: NotificationState;
  stats: StatsState;
}
```

### Slices
- **authSlice**: Authentication state and user information
- **tasksSlice**: Task data and management
- **notificationSlice**: Notification state and management
- **statsSlice**: Statistics and reporting data

### Context Providers
- **AuthContext**: Authentication state and methods
- **NotificationContext**: Notification state and WebSocket management
- **WebSocketContext**: WebSocket connection and event management

---

## WebSocket Integration

### Connection Management
```typescript
// WebSocket connection setup
const socket = io(`${backendUrl}/tasks`, {
  auth: { token: jwtToken },
  transports: ['websocket'],
});
```

### Event Handling
```typescript
// Subscribe to task updates
socket.emit('subscribe:task', { taskId });

// Listen for task updates
socket.on('task:updated', (task) => {
  // Update task in Redux store
});

// Listen for notifications
socket.on('notification:new', (notification) => {
  // Add notification to state
});
```

### Custom Hooks
- **useTaskSocket**: Manages task-related WebSocket events
- **useNotificationSocket**: Manages notification WebSocket events
- **useCommentSocket**: Manages comment-related WebSocket events

### Reconnection Logic
- **Automatic reconnection** on connection loss
- **Token refresh** on authentication errors
- **Event replay** for missed updates
- **Connection state monitoring**

---

## Push Notifications

### Service Worker
```javascript
// service-worker.js
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/logo192.png',
    badge: '/logo192.png',
    actions: [
      {
        action: 'open',
        title: 'Open Task',
      },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification('Task Manager', options)
  );
});
```

### Subscription Management
```typescript
// Subscribe to push notifications
const subscribeToPushNotifications = async () => {
  const registration = await navigator.serviceWorker.register('/service-worker.js');
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey,
  });
  
  await pushService.subscribe(subscription);
};
```

### Permission Handling
- **Permission requests** with user-friendly prompts
- **Permission state monitoring** and updates
- **Graceful degradation** when permissions are denied
- **Permission restoration** after browser updates

---

## API Integration

### Service Layer
- **authService**: Authentication API calls
- **taskService**: Task management API calls
- **userService**: User management API calls
- **pushService**: Push notification API calls

### Error Handling
- **Global error handling** with toast notifications
- **Network error recovery** with retry logic
- **Authentication error handling** with automatic logout
- **Validation error display** in forms

### Request/Response Interceptors
```typescript
// Axios interceptors for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
    }
    return Promise.reject(error);
  }
);
```

---

## Styling & UI

### Tailwind CSS
- **Utility-first approach** for rapid development
- **Custom design system** with consistent spacing and colors
- **Responsive design** for all screen sizes
- **Dark mode support** (planned feature)

### Component Design
- **Consistent spacing** and typography
- **Accessible design** with proper ARIA labels
- **Loading states** and skeleton screens
- **Error states** with helpful messages
- **Success feedback** with toast notifications

### Responsive Design
- **Mobile-first approach** with progressive enhancement
- **Breakpoint system** for different screen sizes
- **Touch-friendly interfaces** for mobile devices
- **Keyboard navigation** support for accessibility

---

## Performance Optimization

### Code Splitting
```typescript
// Lazy loading for routes
const TaskDetailsPage = lazy(() => import('./pages/TaskDetailsPage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
```

### Bundle Optimization
- **Tree shaking** for unused code removal
- **Dynamic imports** for code splitting
- **Image optimization** and compression
- **Service worker caching** for static assets

### Memory Management
- **Component cleanup** in useEffect hooks
- **Event listener cleanup** for WebSocket connections
- **Redux state optimization** with selective subscriptions
- **Image lazy loading** for better performance

### Caching Strategies
- **React Query caching** for API responses
- **Service worker caching** for static assets
- **Local storage caching** for user preferences
- **Session storage** for temporary data

---

## Testing

### Unit Testing
```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Testing Libraries
- **Jest** for test framework
- **React Testing Library** for component testing
- **MSW (Mock Service Worker)** for API mocking
- **User Event** for user interaction testing

### Test Coverage
- **Component testing** for UI components
- **Hook testing** for custom hooks
- **Service testing** for API calls
- **Integration testing** for user workflows
- **WebSocket testing** for real-time features

---

## Environment Configuration

### Development
```bash
REACT_APP_BACKEND_URL=http://localhost:3000
REACT_APP_ENV=development
```

### Production
```bash
REACT_APP_BACKEND_URL=https://your-api-domain.com
REACT_APP_ENV=production
```

### Environment Variables
- `REACT_APP_BACKEND_URL`: Backend API URL
- `REACT_APP_ENV`: Environment (development/production)
- `REACT_APP_VERSION`: Application version
- `REACT_APP_NAME`: Application name

---

## Build & Deployment

### Build Process
```bash
# Create production build
npm run build

# Analyze bundle size
npm run analyze

# Build for different environments
npm run build:staging
npm run build:production
```

### Deployment Options
- **Static hosting** (Netlify, Vercel, GitHub Pages)
- **Docker containers** for containerized deployment
- **CDN integration** for static assets
- **Service worker** for offline support

### Build Optimization
- **Code splitting** for better load times
- **Bundle analysis** for size optimization
- **Compression** for smaller file sizes
- **Cache busting** for version control

---

## Browser Support

### Supported Browsers
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Feature Detection
- **Service Worker** support for push notifications
- **Web Push API** support for browser notifications
- **WebSocket** support for real-time features
- **Local Storage** support for data persistence

### Polyfills
- **Core-js** for JavaScript polyfills
- **Regenerator-runtime** for async/await support
- **Intersection Observer** for lazy loading
- **Resize Observer** for responsive design

---

## Accessibility

### ARIA Support
- **Proper ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus management** for modals and forms
- **Color contrast** compliance

### Screen Reader Support
- **Semantic HTML** structure
- **Alt text** for images
- **Form labels** and descriptions
- **Status announcements** for dynamic content

### Keyboard Navigation
- **Tab order** optimization
- **Keyboard shortcuts** for common actions
- **Focus indicators** for interactive elements
- **Escape key** handling for modals

---

## Security

### Authentication Security
- **JWT token storage** in secure HTTP-only cookies
- **Token refresh** for session management
- **Automatic logout** on token expiration
- **CSRF protection** for API calls

### Data Security
- **Input validation** and sanitization
- **XSS prevention** with proper escaping
- **Secure communication** with HTTPS
- **Data encryption** for sensitive information

### WebSocket Security
- **JWT authentication** for WebSocket connections
- **User isolation** through personal rooms
- **Input validation** for all WebSocket events
- **Rate limiting** for WebSocket events

---

## Monitoring & Analytics

### Error Tracking
- **Error boundaries** for React components
- **Global error handling** with logging
- **Performance monitoring** for user experience
- **Crash reporting** for debugging

### User Analytics
- **Page view tracking** for user behavior
- **Feature usage** monitoring
- **Performance metrics** collection
- **User engagement** tracking

### Performance Monitoring
- **Core Web Vitals** tracking
- **Bundle size** monitoring
- **Load time** optimization
- **Memory usage** tracking

---

## Troubleshooting

### Common Issues
- **WebSocket connection issues**: Check backend URL and authentication
- **Push notification failures**: Verify VAPID keys and permissions
- **Build errors**: Check TypeScript types and dependencies
- **Performance issues**: Analyze bundle size and optimize imports

### Debug Tools
- **React DevTools** for component debugging
- **Redux DevTools** for state management
- **Network tab** for API debugging
- **Console logging** for WebSocket events

### Browser-Specific Issues
- **Safari push notifications**: Ensure proper VAPID configuration
- **Firefox service worker**: Check service worker registration
- **Chrome notifications**: Verify notification permissions
- **Mobile browser support**: Test on various mobile browsers

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

### Testing Requirements
- **Unit tests** for new components
- **Integration tests** for new features
- **Accessibility testing** for UI components
- **Cross-browser testing** for compatibility

---

## License

MIT License - see LICENSE file for details

---

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation and troubleshooting guides
- Review the component documentation
- Contact the development team