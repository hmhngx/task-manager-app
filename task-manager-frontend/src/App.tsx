import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminTasksDashboard from './components/AdminTasksDashboard';
import TaskList from './components/TaskList';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ReportScreen from './components/Reports/ReportScreen';
import NotificationToast from './components/NotificationToast';
import { getTasks } from './services/taskService';
import './App.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [tasksLeft, setTasksLeft] = React.useState(0);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      try {
        const tasks = await getTasks();
        const todayStr = selectedDate
          ? selectedDate.toDateString()
          : new Date().toDateString();
        const tasksForToday = tasks.filter(
          (task) =>
            task.deadline && new Date(task.deadline).toDateString() === todayStr
        );
        setCompletedCount(tasksForToday.filter((task) => task.status === 'done').length);
        setTasksLeft(tasksForToday.filter((task) => task.status !== 'done').length);
      } catch (err) {
        setCompletedCount(0);
        setTasksLeft(0);
      }
    };
    fetchTasks();
  }, [user, selectedDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full max-w-7xl mx-auto py-8 px-4">
        <Sidebar 
          selectedDate={selectedDate} 
          setSelectedDate={setSelectedDate} 
          tasksLeft={tasksLeft} 
          completedCount={completedCount} 
          user={user || null} 
          isAdmin={user?.role === 'admin' || false} 
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 flex flex-col transition-all duration-300">
          {children}
        </main>
      </div>
      {/* Real-time notification toast */}
      <NotificationToast position="top-right" />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
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
                  <Route path="reports" element={<PrivateRoute><ReportScreen /></PrivateRoute>} />
                  <Route path="" element={<TaskList selectedDate={null} isAdmin={false} />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;