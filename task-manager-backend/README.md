Task Manager Backend
A full-stack task management application backend built with NestJS, MongoDB, and TypeScript, featuring user authentication and task CRUD operations.
Features

User registration and login with JWT authentication
Create, read, update, and delete tasks with categories
MongoDB for persistent storage
Input validation with class-validator
API documentation with Swagger
Unit tests with Jest

Tech Stack

NestJS: Backend framework
MongoDB: Database
TypeScript: Type-safe JavaScript
JWT: Authentication
Swagger: API documentation

Setup

Clone the repository:git clone <repo-url>
cd task-manager-backend


Install dependencies:npm install


Set up MongoDB (e.g., MongoDB Atlas) and update the connection string in src/app.module.ts.
Run the app:npm run start:dev


Access the API at http://localhost:3000 and Swagger docs at http://localhost:3000/api.

API Endpoints

POST /auth/register: Register a new user
POST /auth/login: Login and receive a JWT
GET /tasks: Get all tasks for the authenticated user
GET /tasks/:id: Get a specific task
POST /tasks: Create a new task
PATCH /tasks/:id: Update a task
DELETE /tasks/:id: Delete a task

