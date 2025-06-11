import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, getUserDisplayName } from '../types/user';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  tasksLeft: number;
  completedCount: number;
  user: User | null;
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedDate,
  setSelectedDate,
  tasksLeft,
  completedCount,
  user,
  isAdmin,
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-white rounded-lg shadow-md p-4">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Task Manager</h2>
          {user && (
            <p className="text-sm text-gray-600 mt-1">
              Welcome, {getUserDisplayName(user)}
            </p>
          )}
        </div>

        <nav className="space-y-2">
          <Link
            to="/"
            className={`block px-4 py-2 rounded-md ${
              isActive('/') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tasks
          </Link>

          <Link
            to="/dashboard"
            className={`block px-4 py-2 rounded-md ${
              isActive('/dashboard') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/reports"
            className={`block px-4 py-2 rounded-md ${
              isActive('/reports') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Reports
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/admin"
                className={`block px-4 py-2 rounded-md ${
                  isActive('/admin') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Admin Dashboard
              </Link>

              <Link
                to="/admin/tasks"
                className={`block px-4 py-2 rounded-md ${
                  isActive('/admin/tasks') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Manage Tasks
              </Link>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar; 