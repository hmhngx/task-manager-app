# Task Manager Application

A full-stack, modern task management application built with React, NestJS, and MongoDB.  
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
- Responsive UI with Tailwind CSS
- State management with Redux Toolkit
- API documentation with Swagger

---

## Real-Time Notification System

The application includes a comprehensive real-time notification system with the following features:

-   **Live Task Updates**: All task changes are broadcast instantly to relevant users.
-   **Assignment & Mention Notifications**: Users receive immediate alerts for task assignments and when they are mentioned in comments.
-   **Task Request Alerts**: Admins are notified of new task requests, and users receive real-time updates on the status of their requests.
-   **Deadline & Overdue Reminders**: The system automatically sends notifications for upcoming deadlines and overdue tasks.
-   **Push Notifications**: A pop-up notification system ensures that users never miss important updates.

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
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
npm run start:dev
```
- API: http://localhost:3000
- WebSocket: ws://localhost:3000
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
- App: http://localhost:3000 (or as configured)

---

## Technologies Used

- **Frontend:** 
  - React with TypeScript
  - Redux Toolkit for state management
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
  - **@nestjs/schedule** for cron jobs

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