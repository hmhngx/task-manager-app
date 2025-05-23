# Task Manager Application

A full-stack task management application built with React, NestJS, and MongoDB.

## Project Structure

The project is organized as a monorepo with two main directories:

- `task-manager-frontend/`: React frontend application
- `task-manager-backend/`: NestJS backend application

## Features

- User authentication and authorization
- Create, read, update, and delete tasks
- Task status management
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd task-manager-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd task-manager-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - React Router
  - Axios

- Backend:
  - NestJS
  - TypeScript
  - MongoDB
  - JWT Authentication
  - Passport.js

## License

MIT 