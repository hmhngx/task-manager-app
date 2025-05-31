import React, { useEffect, useState } from 'react';
import { TaskStats } from '../types';
import { getWeeklyStats, getMonthlyStats } from '../services/taskService';

interface StatsPanelProps {
  isAdmin: boolean;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ isAdmin }) => {
  const [weeklyStats, setWeeklyStats] = useState<TaskStats>({
    todo: 0,
    done: 0,
    late: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState<TaskStats>({
    todo: 0,
    done: 0,
    late: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [weekly, monthly] = await Promise.all([
          getWeeklyStats(),
          getMonthlyStats(),
        ]);
        setWeeklyStats(weekly);
        setMonthlyStats(monthly);
      } catch (err) {
        setError('Failed to fetch stats');
      }
    };

    fetchStats();
    // Refresh stats every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="flex flex-col gap-6 min-w-[260px] max-w-xs">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* Weekly Stats */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer">
        <div className="font-semibold text-gray-700 mb-2">
          {isAdmin ? 'All Users Weekly Stats' : 'Your Weekly Stats'}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-600">
              {weeklyStats.todo}
            </div>
            <div className="text-xs text-gray-500">To Do</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-red-500">
              {weeklyStats.late}
            </div>
            <div className="text-xs text-gray-500">Late</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-green-600">
              {weeklyStats.done}
            </div>
            <div className="text-xs text-gray-500">Done</div>
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer">
        <div className="font-semibold text-gray-700 mb-2">
          {isAdmin ? 'All Users Monthly Stats' : 'Your Monthly Stats'}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-600">
              {monthlyStats.todo}
            </div>
            <div className="text-xs text-gray-500">To Do</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-red-500">
              {monthlyStats.late}
            </div>
            <div className="text-xs text-gray-500">Late</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-green-600">
              {monthlyStats.done}
            </div>
            <div className="text-xs text-gray-500">Done</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StatsPanel;
