# Task Manager Backend

A robust backend for the Task Manager app, built with NestJS, MongoDB, and TypeScript, featuring **real-time WebSocket integration** for live collaboration.

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
- **Real-time WebSocket integration**
- **Live task updates and notifications**
- **Real-time comments and mentions**
- **Admin dashboard monitoring**
- **Live activity feed**
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
- **Socket.IO**: Real-time WebSocket communication
- **Swagger**: API documentation
- **Class-validator**: Input validation
- **Passport.js**: Authentication strategies
- **Winston**: Logging

---

## WebSocket Integration

### Architecture
```
src/modules/websocket/
├── websocket.module.ts          # Main WebSocket module
├── services/
│   └── websocket.service.ts     # Centralized WebSocket service
├── gateways/
│   ├── task.gateway.ts          # Task-related events
│   ├── notification.gateway.ts  # Notification events
│   └── admin.gateway.ts         # Admin monitoring events
└── guards/
    └── websocket-auth.guard.ts  # JWT authentication for WebSocket
```

### WebSocket Events

#### Task Events
- `task:created` - New task created
- `task:updated` - Task modified
- `task:deleted` - Task removed
- `task:assigned` - Task assigned to user
- `task:status_changed` - Status transition

#### Comment Events
- `comment:added` - New comment on task
- `comment:edited` - Comment modified
- `comment:deleted` - Comment removed

#### Notification Events
- `notification:task_assigned` - Task assignment
- `notification:status_change` - Status updates
- `notification:mention` - Comment mentions
- `notification:deadline_approaching` - Deadline reminders

#### Admin Events
- `admin:user_activity` - User login/logout
- `admin:task_activity` - Task creation/completion
- `admin:system_stats` - Updated statistics

### Security
- JWT authentication for WebSocket connections
- Room-based subscriptions with proper authorization
- User information attached to socket for authorization

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
   FRONTEND_URL=http://localhost:3001
   ```

4. Start the app:
   ```bash
   npm run start:dev
   ```

5. Access the API at [http://localhost:3000](http://localhost:3000)  
   WebSocket at [ws://localhost:3000/tasks](ws://localhost:3000/tasks)  
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
- `GET /tasks/stats/weekly` — Get weekly task statistics
- `GET /tasks/stats/weekly/detailed` — Get detailed weekly statistics
- `GET /reports/tasks` — Get task reports with filtering
- `POST /tasks/:id/attachments` — Upload an attachment
- `POST /tasks/:id/comments` — Add a comment

---

## Environment Variables

- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for JWT authentication
- `PORT` — Server port (default: 3000)
- `NODE_ENV` — Environment (development/production)
- `FRONTEND_URL` — Frontend URL for CORS configuration

---

## Error Handling

- All endpoints return appropriate HTTP status codes and error messages
- Centralized error handling middleware
- Request validation using class-validator
- Detailed error logging with Winston
- Stack traces in development mode only
- WebSocket error handling with reconnection logic

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

## WebSocket Configuration

### CORS Setup
```typescript
@WebSocketGateway({
  namespace: '/tasks',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
```

### Authentication
WebSocket connections require valid JWT tokens passed in the auth object:
```typescript
const socket = io(`${backendUrl}/tasks`, {
  auth: { token: jwtToken },
  transports: ['websocket', 'polling'],
});
```

---

## License

MIT