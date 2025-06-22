# Task Manager Frontend

A modern, feature-rich task management frontend built with React, TypeScript, Redux Toolkit, and Material-UI, featuring **real-time WebSocket integration** for live collaboration.

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
- Sidebar navigation (customizable)
- Responsive design
- Modern UI with Material-UI and Tailwind CSS
- State management with Redux Toolkit
- Excel export functionality
- Advanced reporting and data visualization

---

## WebSocket Integration

### Architecture
```
src/
├── contexts/
│   └── WebSocketContext.tsx     # Centralized WebSocket context
├── hooks/
│   ├── useTaskSocket.ts         # Task-specific WebSocket hook
│   ├── useCommentSocket.ts      # Comment-specific WebSocket hook
│   └── useNotificationSocket.ts # Notification WebSocket hook
└── components/
    └── NotificationToast.tsx    # Real-time notification UI
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

---

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

---

## Environment Setup

1. Create a `.env` file in the root directory:
   ```
   REACT_APP_API_URL=http://localhost:3000
   REACT_APP_ENV=development
   ```

2. Adjust `REACT_APP_API_URL` if your backend is running on a different port or host.

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
src/
├── components/ # Reusable UI components (Sidebar, Navbar, TaskDetails, etc.)
├── contexts/ # React contexts (auth, WebSocket, etc.)
├── hooks/ # Custom hooks including WebSocket hooks
├── pages/ # Page components
├── services/ # API services
├── store/ # Redux store configuration and slices
├── types/ # TypeScript type definitions
└── utils/ # Utility functions

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

## Customization

- **Sidebar:** You can easily add or remove navigation elements in `src/components/Sidebar.tsx`.
- **UI:** Styling is done with a combination of Material-UI and Tailwind CSS.
- **State Management:** Redux store configuration can be modified in `src/store/`.
- **WebSocket:** WebSocket context and hooks can be customized in `src/contexts/` and `src/hooks/`.

---

## Troubleshooting

- **Blank screen after update:** Check browser console for errors, ensure backend is running.
- **API 500 errors:** Check backend logs for stack traces.
- **React key warnings:** Ensure all `.map()` calls use unique keys.
- **Redux state issues:** Use Redux DevTools to debug state updates and actions.
- **WebSocket connection issues:** Check CORS configuration and JWT token validity.
- **Real-time events not working:** Verify WebSocket connection status and room subscriptions.

---

## License

MIT