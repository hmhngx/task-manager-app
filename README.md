# Task Manager Application

A full-stack, modern task management application built with React, NestJS, MongoDB, and Redux.  
Supports user/admin roles, task assignment, approval workflows, comments, attachments, and **real-time collaboration** via WebSocket integration.

---

## Project Structure

├── task-manager-frontend/ # React frontend with Redux
├── task-manager-backend/ # NestJS backend
└── README.md # This file


---

## Features

- User authentication (JWT)
- Admin and user roles
- Create, read, update, delete (CRUD) tasks
- Task assignment and approval workflow
- Task request/approval/rejection by admin
- Comments and file attachments on tasks
- Task status management (todo, in progress, done, late, etc.)
- Dashboard and reporting with data visualization
- **Real-time collaboration via WebSocket integration**
- **Live task updates and notifications**
- **Real-time comments and mentions**
- **Admin dashboard with live monitoring**
- **Live activity feed**
- Responsive UI with Tailwind CSS and Material-UI
- State management with Redux Toolkit
- API documentation with Swagger

---

## Real-Time Features

### 🚀 WebSocket Integration
The application includes comprehensive real-time functionality:

- **Live Task Updates**: Status changes, assignments, and modifications broadcast instantly
- **Real-Time Comments**: New comments appear instantly with mention notifications
- **Live Notifications**: Task assignments, status changes, and deadline reminders
- **Admin Dashboard Monitoring**: Real-time user activity and system statistics
- **Live Activity Feed**: System-wide events and collaboration awareness

### 📡 WebSocket Architecture
- **Backend**: NestJS WebSocket gateways with JWT authentication
- **Frontend**: React WebSocket context with custom hooks
- **Events**: Task updates, comments, notifications, and admin monitoring
- **Security**: Room-based subscriptions with proper authorization

---

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

---

## Getting Started

### 1. Backend Setup

```bash
cd task-manager-backend
npm install
```

Create a `.env` file:
```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3001
```

Start the backend:
```bash
npm run start:dev
```
- API: http://localhost:3000
- WebSocket: ws://localhost:3000/tasks
- Swagger docs: http://localhost:3000/api

---

### 2. Frontend Setup

```bash
cd task-manager-frontend
npm install
```

Create a `.env` file:

```bash
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENV=development
```


Start the frontend:
```bash
npm start
```
- App: http://localhost:3001 (or as configured)

---

## Technologies Used

- **Frontend:** 
  - React with TypeScript
  - Redux Toolkit for state management
  - Material-UI for UI components
  - Tailwind CSS for styling
  - React Router for navigation
  - Axios for API calls
  - **Socket.IO client for real-time communication**
  - XLSX for Excel export
  - Day.js for date handling

- **Backend:** 
  - NestJS with TypeScript
  - MongoDB with Mongoose
  - JWT for authentication
  - Passport.js for auth strategies
  - **Socket.IO for WebSocket functionality**
  - Swagger for API documentation
  - Class-validator for input validation

---

## WebSocket Events

### Task Events
- `task:created` - New task created
- `task:updated` - Task modified
- `task:deleted` - Task removed
- `task:assigned` - Task assigned to user
- `task:status_changed` - Status transition

### Comment Events
- `comment:added` - New comment on task
- `comment:edited` - Comment modified
- `comment:deleted` - Comment removed

### Notification Events
- `notification:task_assigned` - Task assignment
- `notification:status_change` - Status updates
- `notification:mention` - Comment mentions
- `notification:deadline_approaching` - Deadline reminders

### Admin Events
- `admin:user_activity` - User login/logout
- `admin:task_activity` - Task creation/completion
- `admin:system_stats` - Updated statistics

---

## Troubleshooting

- **Blank screen after update:** Check browser console for errors, ensure backend is running.
- **API 500 errors:** Check backend logs for stack traces.
- **MongoDB connection issues:** Verify your `MONGODB_URI` and database status.
- **Redux state issues:** Check Redux DevTools for state updates and actions.
- **WebSocket connection issues:** Check CORS configuration and JWT token validity.
- **Real-time events not working:** Verify WebSocket connection status and room subscriptions.

---

## License

MIT