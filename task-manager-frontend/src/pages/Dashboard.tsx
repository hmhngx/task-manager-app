import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TaskList from '../components/TaskList';
import Sidebar from '../components/Sidebar';
import StatsPanel from '../components/StatsPanel';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f4f7fd] flex flex-col">
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
                <span className="font-semibold text-gray-700">Karen West</span>
                <span className="text-xs text-gray-400">Last seen: Today</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
          tasksLeft={0}
        />
        <div className="flex-1 flex flex-col">
          <TaskList selectedDate={selectedDate} />
        </div>
        <StatsPanel />
      </main>
    </div>
  );
};

export default Dashboard; 