import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface SidebarProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  tasksLeft: number;
  completedCount: number;
  user: User | null;
  isAdmin: boolean;
}

const navLinks = [
  { to: '/', label: 'Tasks', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  ) },
  { to: '/dashboard', label: 'Dashboard', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
  ) },
];

const Sidebar: React.FC<SidebarProps> = ({
  selectedDate,
  setSelectedDate,
  tasksLeft,
  completedCount,
  user,
  isAdmin,
}) => {
  const location = useLocation();
  return (
    <aside className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col gap-8 min-w-[260px] max-w-xs h-fit sticky top-24 self-start border border-blue-100">
      {/* Navigation */}
      <nav className="flex flex-col gap-2 mb-2">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors text-base ${location.pathname === link.to ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-800'}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>
      {/* Greeting */}
      <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer">
        <div className="bg-blue-100 rounded-lg p-2">
          <svg
            className="w-8 h-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2l4 -4"
            />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-gray-800">
            Hi, {user?.username || 'User'}!
          </div>
          <div className="text-xs text-gray-500">
            {isAdmin ? (
              <span>You have admin access to all tasks.</span>
            ) : (
              <>
                You have{' '}
                <span className="font-bold text-blue-600 underline hover:text-blue-800 transition cursor-pointer">
                  {tasksLeft} tasks
                </span>{' '}
                left for today.
                <br />
                Already completed {completedCount} Tasks today.
              </>
            )}
          </div>
        </div>
      </div>
      {/* Calendar */}
      <div className="bg-white rounded-xl p-2 shadow-sm border border-blue-100">
        <Calendar
          onChange={(date) => setSelectedDate(date as Date)}
          value={selectedDate}
          className="mx-auto border-0"
          tileClassName={({ date }) =>
            date.toDateString() ===
            (selectedDate ? selectedDate.toDateString() : '')
              ? 'bg-blue-100 text-blue-700 rounded-full'
              : 'hover:bg-blue-100 hover:text-blue-700 rounded-full cursor-pointer'
          }
        />
      </div>
    </aside>
  );
};

export default Sidebar;