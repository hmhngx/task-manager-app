import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TaskList from '../components/TaskList';
import Sidebar from '../components/Sidebar';
import StatsPanel from '../components/StatsPanel';
import { Task, TaskStats } from '../types/Task';
import { useEffect, useState } from 'react';
import { getTasks, getTaskStats } from '../services/taskService';
import Button from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const { logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TaskStats>({
    todo: 0,
    done: 0,
    late: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, statsData] = await Promise.all([
          getTasks(),
          getTaskStats()
        ]);
        setTasks(tasksData);
        setStats(statsData);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter tasks for the selected day
  const todayStr = selectedDate
    ? selectedDate.toDateString()
    : new Date().toDateString();
  const tasksForToday = tasks.filter(
    (task) =>
      task.deadline && new Date(task.deadline).toDateString() === todayStr
  );

  const completedCount = tasksForToday.filter(
    (task) => task.status === 'done'
  ).length;

  const leftCount = tasksForToday.filter(
    (task) => task.status !== 'done'
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
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
        <StatsPanel isAdmin={isAdmin} stats={stats} />
      </main>
    </div>
  );
};

export default Dashboard;
