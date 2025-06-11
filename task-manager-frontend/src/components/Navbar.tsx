import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, getUserDisplayName } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  if (!isAuthenticated) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100" role="navigation" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-indigo-700 text-2xl font-extrabold tracking-tight flex items-center gap-2 hover:text-indigo-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
              tabIndex={0}
            >
              <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Task Manager
            </Link>
            {/* Admin Navbar */}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className={`text-base font-medium px-3 py-2 rounded transition-colors ${location.pathname === '/admin' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-800'}`}
                >
                  Manage Users
                </Link>
                <Link
                  to="/admin/tasks"
                  className={`text-base font-medium px-3 py-2 rounded transition-colors ${location.pathname === '/admin/tasks' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-800'}`}
                >
                  Manage All Tasks
                </Link>
                <Link
                  to="/dashboard"
                  className={`text-base font-medium px-3 py-2 rounded transition-colors ${location.pathname === '/dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-800'}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/"
                  className={`text-base font-medium px-3 py-2 rounded transition-colors ${location.pathname === '/' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-800'}`}
                >
                  Tasks
                </Link>
              </>
            )}
            {/* User Navbar */}
            {!isAdmin && (
              <>
                <Link
                  to="/"
                  className={`text-base font-medium px-3 py-2 rounded transition-colors ${location.pathname === '/' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-800'}`}
                >
                  Tasks
                </Link>
                <Link
                  to="/dashboard"
                  className={`text-base font-medium px-3 py-2 rounded transition-colors ${location.pathname === '/dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-800'}`}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-gray-700 font-semibold">{user ? getUserDisplayName(user) : ''}</span>
              {isAdmin && (
                <span className="text-xs text-gray-400">Administrator • Last seen: Today</span>
              )}
            </div>
            <Button
              onClick={logout}
              variant="danger"
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}