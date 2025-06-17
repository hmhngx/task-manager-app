# Task Manager Backend

A robust backend for the Task Manager app, built with NestJS, MongoDB, and TypeScript.

---

## Features

- User registration and login (JWT)
- Admin and user roles
- Task CRUD (create, read, update, delete)
- Task assignment and approval workflow
- Task request/approval/rejection endpoints
- Comments and file attachments
- Task watchers and requesters
- Task statistics and reporting endpoints
- Advanced filtering and pagination
- Input validation with class-validator
- API documentation with Swagger
- Unit tests with Jest
- Error handling middleware
- Request logging and monitoring

---

## Tech Stack

- **NestJS**: Backend framework
- **MongoDB**: Database with Mongoose ODM
- **TypeScript**: Type-safe JavaScript
- **JWT**: Authentication
- **Swagger**: API documentation
- **Class-validator**: Input validation
- **Passport.js**: Authentication strategies
- **Winston**: Logging

---

## Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd task-manager-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3000
   NODE_ENV=development
   ```

4. Start the app:
   ```bash
   npm run start:dev
   ```

5. Access the API at [http://localhost:3000](http://localhost:3000)  
   Swagger docs: [http://localhost:3000/api](http://localhost:3000/api)

---

## Main API Endpoints

- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login and receive a JWT
- `GET /tasks` — Get all tasks for the authenticated user
- `GET /tasks/:id` — Get a specific task
- `POST /tasks` — Create a new task
- `PATCH /tasks/:id` — Update a task
- `DELETE /tasks/:id` — Delete a task
- `POST /tasks/:id/request` — Request assignment to a task
- `POST /tasks/:id/approve/:requesterId` — Admin approves a user's request
- `POST /tasks/:id/reject/:requesterId` — Admin rejects a user's request
- `GET /tasks/stats` — Get task statistics
- `GET /reports/tasks` — Get task reports with filtering
- `POST /tasks/:id/attachments` — Upload an attachment
- `POST /tasks/:id/comments` — Add a comment

---

## Environment Variables

- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for JWT authentication
- `PORT` — Server port (default: 3000)
- `NODE_ENV` — Environment (development/production)

---

## Error Handling

- All endpoints return appropriate HTTP status codes and error messages
- Centralized error handling middleware
- Request validation using class-validator
- Detailed error logging with Winston
- Stack traces in development mode only

---

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

---

## API Documentation

The API is documented using Swagger. Access the documentation at:
- Development: http://localhost:3000/api
- Production: https://your-domain.com/api

---

## License

MIT