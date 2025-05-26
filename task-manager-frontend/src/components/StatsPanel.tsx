import React from 'react';

interface StatsPanelProps {
  weeklyStats: { todo: number; late: number; done: number };
  monthlyStats: { todo: number; late: number; done: number };
}

const StatsPanel: React.FC<StatsPanelProps> = ({ weeklyStats, monthlyStats }) => {
  return (
    <aside className="flex flex-col gap-6 min-w-[260px] max-w-xs">
      {/* Weekly Stats */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
        <div className="font-semibold text-gray-700 mb-2">Weekly Stats</div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-600">{weeklyStats.todo}</div>
            <div className="text-xs text-gray-500">To Do</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-400">{weeklyStats.late}</div>
            <div className="text-xs text-gray-500">Late</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-800">{weeklyStats.done}</div>
            <div className="text-xs text-gray-500">Done</div>
          </div>
        </div>
      </div>
      {/* Monthly Stats */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
        <div className="font-semibold text-gray-700 mb-2">Monthly Stats</div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-600">{monthlyStats.todo}</div>
            <div className="text-xs text-gray-500">To Do</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-400">{monthlyStats.late}</div>
            <div className="text-xs text-gray-500">Late</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-800">{monthlyStats.done}</div>
            <div className="text-xs text-gray-500">Done</div>
          </div>
        </div>
      </div>
      {/* Info Card */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">
        <div className="mb-2">
          {/* Placeholder for info icon */}
          <svg className="w-10 h-10 text-blue-400 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
        </div>
        <div className="font-semibold text-gray-700">Never Loose Track</div>
        <div className="text-xs text-gray-500 mt-1">Become a <span className="text-blue-600 font-bold">Premium User</span> and get access to more features such as alerts, notifications and much more!</div>
      </div>
    </aside>
  );
};

export default StatsPanel; 