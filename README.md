# Task Manager Application

A full-stack, modern task management application built with React, NestJS, and MongoDB.  
Supports user/admin roles, task assignment, approval workflows, comments, attachments, and more.

---

## Project Structure

├── task-manager-frontend/ # React frontend
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
- Dashboard and reporting
- Responsive UI with Tailwind CSS
- API documentation with Swagger

---

## Prerequisites

- Node.js (v14 or higher)
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
```

Start the backend:
```bash
npm run start:dev
```
- API: http://localhost:3000
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

- **Frontend:** React, TypeScript, Tailwind CSS, React Router, Axios
- **Backend:** NestJS, TypeScript, MongoDB, JWT, Passport.js, Swagger

---

## Troubleshooting

- **Blank screen after update:** Check browser console for errors, ensure backend is running.
- **API 500 errors:** Check backend logs for stack traces.
- **MongoDB connection issues:** Verify your `MONGODB_URI` and database status.

---

## License

MIT