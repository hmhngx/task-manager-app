import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchStats, fetchDetailedWeeklyStats } from '../store/statsSlice';
import { useAppDispatch } from '../store';

interface StatsPanelProps {
  isAdmin: boolean;
}

const statIcons = {
  todo: (
    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2l4-4" /></svg>
  ),
  late: (
    <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6" /></svg>
  ),
  done: (
    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4-4" /></svg>
  ),
  in_progress: (
    <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  created: (
    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
  ),
  completed: (
    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  ),
  updated: (
    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
  ),
};

const StatsPanel: React.FC<StatsPanelProps> = ({ isAdmin }) => {
  const dispatch = useAppDispatch();
  const { weekly, monthly, detailedWeekly, loading, error } = useSelector((state: RootState) => state.stats);

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchDetailedWeeklyStats());
    const interval = setInterval(() => {
      dispatch(fetchStats());
      dispatch(fetchDetailedWeeklyStats());
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  return (
    <aside className="flex flex-col gap-8 min-w-[260px] max-w-xs">
      {/* Weekly Stats - Current Status */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-2xl border border-blue-100">
        <div className="font-semibold text-gray-700 mb-2 text-lg">
          {isAdmin ? 'All Users Weekly Stats' : 'Your Weekly Stats'}
        </div>
        <div className="flex items-center justify-evenly w-full gap-4">
          <div className="flex flex-col items-center flex-1">
            {statIcons.todo}
            <div className="text-4xl font-extrabold text-blue-600 mt-1">{weekly?.todo ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">To Do</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            {statIcons.in_progress}
            <div className="text-4xl font-extrabold text-yellow-500 mt-1">{weekly?.in_progress ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">In_Progress</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            {statIcons.late}
            <div className="text-4xl font-extrabold text-red-500 mt-1">{weekly?.late ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">Late</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            {statIcons.done}
            <div className="text-4xl font-extrabold text-green-600 mt-1">{weekly?.done ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">Done</div>
          </div>
        </div>
      </div>

      {/* Weekly Activity Stats */}
      {detailedWeekly && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-2xl border border-purple-100">
          <div className="font-semibold text-gray-700 mb-2 text-lg">
            Weekly Activity
          </div>
          <div className="flex items-center justify-evenly w-full gap-4">
            <div className="flex flex-col items-center flex-1">
              {statIcons.created}
              <div className="text-2xl font-bold text-purple-600 mt-1">{detailedWeekly.weeklyActivity.created}</div>
              <div className="text-xs text-gray-500 mt-1">Created</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              {statIcons.completed}
              <div className="text-2xl font-bold text-green-600 mt-1">{detailedWeekly.weeklyActivity.completed}</div>
              <div className="text-xs text-gray-500 mt-1">Completed</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              {statIcons.updated}
              <div className="text-2xl font-bold text-blue-600 mt-1">{detailedWeekly.weeklyActivity.updated}</div>
              <div className="text-xs text-gray-500 mt-1">Updated</div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Stats */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-2xl border border-blue-100">
        <div className="font-semibold text-gray-700 mb-2 text-lg">
          {isAdmin ? 'All Users Monthly Stats' : 'Your Monthly Stats'}
        </div>
        <div className="flex items-center justify-evenly w-full gap-4">
          <div className="flex flex-col items-center flex-1">
            {statIcons.todo}
            <div className="text-4xl font-extrabold text-blue-600 mt-1">{monthly?.todo ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">To Do</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            {statIcons.in_progress}
            <div className="text-4xl font-extrabold text-yellow-500 mt-1">{monthly?.in_progress ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">In_Progress</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            {statIcons.late}
            <div className="text-4xl font-extrabold text-red-500 mt-1">{monthly?.late ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">Late</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            {statIcons.done}
            <div className="text-4xl font-extrabold text-green-600 mt-1">{monthly?.done ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">Done</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StatsPanel;
