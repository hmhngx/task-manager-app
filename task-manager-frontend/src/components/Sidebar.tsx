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
  { 
    to: '/', 
    label: 'My Tasks', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    subItems: [
      { to: '/?filter=todo', label: 'To Do' },
      { to: '/?filter=in-progress', label: 'In Progress' },
      { to: '/?filter=done', label: 'Done' },
    ]
  },
  { 
    to: '/dashboard', 
    label: 'Dashboard', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
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
  const [expandedSection, setExpandedSection] = React.useState<string | null>('My Tasks');

  return (
    <aside className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col gap-8 min-w-[260px] max-w-xs h-fit sticky top-24 self-start border border-blue-100">
      {/* User Profile Section */}
      <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4">
        <div className="bg-blue-100 rounded-lg p-2">
          <svg
            className="w-8 h-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-gray-800">
            {user?.username || 'User'}
          </div>
          <div className="text-xs text-gray-500">
            {isAdmin ? 'Administrator' : 'Regular User'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navLinks.map((link) => (
          <div key={link.to} className="flex flex-col">
            <button
              onClick={() => setExpandedSection(expandedSection === link.label ? null : link.label)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors text-base ${
                location.pathname === link.to ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {link.icon}
                {link.label}
              </div>
              {link.subItems && (
                <svg
                  className={`w-4 h-4 transition-transform ${expandedSection === link.label ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            {link.subItems && expandedSection === link.label && (
              <div className="ml-8 mt-1 flex flex-col gap-1">
                {link.subItems.map((subItem) => (
                  <Link
                    key={subItem.to}
                    to={subItem.to}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      location.pathname + location.search === subItem.to
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-800'
                    }`}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Task Stats */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Task Overview</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Remaining</span>
            <span className="font-medium text-blue-600">{tasksLeft}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="font-medium text-green-600">{completedCount}</span>
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
            date.toDateString() === (selectedDate ? selectedDate.toDateString() : '')
              ? 'bg-blue-100 text-blue-700 rounded-full'
              : 'hover:bg-blue-100 hover:text-blue-700 rounded-full cursor-pointer'
          }
        />
      </div>
    </aside>
  );
};

export default Sidebar;