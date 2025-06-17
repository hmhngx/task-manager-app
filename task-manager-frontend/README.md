# Task Manager Frontend

A modern, feature-rich task management frontend built with React, TypeScript, Redux Toolkit, and Material-UI.

---

## Features

- User authentication (login/register)
- Admin and user dashboards
- Create, read, update, and delete tasks
- Task assignment, request, and approval workflow
- Comments and file attachments on tasks
- Task status management (todo, in progress, done, late, etc.)
- Sidebar navigation (customizable)
- Responsive design
- Modern UI with Material-UI and Tailwind CSS
- State management with Redux Toolkit
- Excel export functionality
- Advanced reporting and data visualization

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
├── contexts/ # React contexts (auth, etc.)
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
- **XLSX** for Excel export functionality
- **Day.js** for date handling

---

## Customization

- **Sidebar:** You can easily add or remove navigation elements in `src/components/Sidebar.tsx`.
- **UI:** Styling is done with a combination of Material-UI and Tailwind CSS.
- **State Management:** Redux store configuration can be modified in `src/store/`.

---

## Troubleshooting

- **Blank screen after update:** Check browser console for errors, ensure backend is running.
- **API 500 errors:** Check backend logs for stack traces.
- **React key warnings:** Ensure all `.map()` calls use unique keys.
- **Redux state issues:** Use Redux DevTools to debug state updates and actions.

---

## License

MIT