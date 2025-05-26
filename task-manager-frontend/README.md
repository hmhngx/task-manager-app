# Task Manager Frontend

A modern task management application built with React, TypeScript, and Tailwind CSS.

## Features

- User authentication (login/register)
- Create, read, update, and delete tasks
- Mark tasks as complete/incomplete
- Responsive design
- Modern UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see backend README)

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:3000
   REACT_APP_ENV=development
   ```

2. Adjust the `REACT_APP_API_URL` if your backend is running on a different port or host.

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── contexts/       # React contexts (auth, etc.)
  ├── pages/         # Page components
  ├── services/      # API services
  ├── types/         # TypeScript type definitions
  └── utils/         # Utility functions
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

