import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminTasksDashboard from './components/AdminTasksDashboard';
import TaskList from './components/TaskList';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import './App.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [tasksLeft, setTasksLeft] = React.useState(0);
  const [completedCount, setCompletedCount] = React.useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full max-w-7xl mx-auto gap-8 py-8 px-4">
        <Sidebar 
          selectedDate={selectedDate} 
          setSelectedDate={setSelectedDate} 
          tasksLeft={tasksLeft} 
          completedCount={completedCount} 
          user={user} 
          isAdmin={user?.role === 'admin'} 
        />
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