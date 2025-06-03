import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminTasksDashboard from './components/AdminTasksDashboard';
import TaskList from './components/TaskList';
import Navbar from './components/Navbar';
import './App.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full max-w-7xl mx-auto gap-8 py-8 px-4">
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth pages: no layout, just the box */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main app pages: wrapped in Layout */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                  <Route path="admin/tasks" element={<PrivateRoute><AdminTasksDashboard /></PrivateRoute>} />
                  <Route path="" element={<TaskList selectedDate={null} isAdmin={false} />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
