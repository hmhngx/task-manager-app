import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchStats } from '../store/statsSlice';
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
};

const StatsPanel: React.FC<StatsPanelProps> = ({ isAdmin }) => {
  const dispatch = useAppDispatch();
  const { weekly, monthly, loading, error } = useSelector((state: RootState) => state.stats);

  useEffect(() => {
    dispatch(fetchStats());
    const interval = setInterval(() => dispatch(fetchStats()), 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  return (
    <aside className="flex flex-col gap-8 min-w-[260px] max-w-xs">
      {/* Weekly Stats */}
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
