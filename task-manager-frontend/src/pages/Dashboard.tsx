import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TaskList from '../components/TaskList';
import Sidebar from '../components/Sidebar';
import StatsPanel from '../components/StatsPanel';
import { Task } from '../types';
import { useEffect, useState } from 'react';
import { getTasks } from '../services/taskService';

const Dashboard: React.FC = () => {
  const { logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        setError('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks for the selected day
  const todayStr = selectedDate ? selectedDate.toDateString() : new Date().toDateString();
  const tasksForToday = tasks.filter(
    (task) => task.deadline && new Date(task.deadline).toDateString() === todayStr
  );

  const completedCount = tasksForToday.filter(
    (task) => task.status === "done"
  ).length;

  const leftCount = tasksForToday.filter(
    (task) => task.status !== "done"
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Top Bar */}
      <nav className="bg-white shadow-sm rounded-b-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-blue-600 text-2xl font-bold flex items-center gap-2">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                TASK MANAGER
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="font-semibold text-gray-700">{user?.username || "User"}</span>
                <span className="text-xs text-gray-400">
                  {isAdmin ? 'Administrator' : 'User'} • Last seen: Today
                </span>
              </div>
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 active:scale-95 transition"
                  >
                    Manage Users
                  </Link>
                  <Link
                    to="/admin/tasks"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 active:scale-95 transition"
                  >
                    Manage All Tasks
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Main 3-column layout */}
      <main className="flex-1 flex flex-row gap-8 max-w-7xl mx-auto w-full py-8">
        <Sidebar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          tasksLeft={leftCount}
          completedCount={completedCount}
          user={user}
          isAdmin={isAdmin}
        />
        <div className="flex-1 flex flex-col">
          <TaskList selectedDate={selectedDate} isAdmin={isAdmin} />
        </div>
        <StatsPanel isAdmin={isAdmin} />
      </main>
    </div>
  );
};

export default Dashboard;