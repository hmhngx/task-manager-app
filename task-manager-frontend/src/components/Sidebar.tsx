import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, getUserDisplayName } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiPieChart, FiFileText, FiSettings, FiUsers, FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { IconType } from 'react-icons';
import UserAvatar from './UserAvatar';

interface SidebarProps {
  tasksLeft: number;
  completedCount: number;
  user: User | null;
  isAdmin: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  selectedDate: Date | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
}

const Sidebar: React.FC<SidebarProps> = ({
  tasksLeft,
  completedCount,
  user,
  isAdmin,
  isCollapsed,
  toggleSidebar,
  selectedDate,
  setSelectedDate
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768 && isCollapsed) {
        toggleSidebar();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed, toggleSidebar]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalTasks = tasksLeft + completedCount;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const NavItem = ({ to, icon: Icon, label, adminOnly = false }: { 
    to: string; 
    icon: React.ComponentType<{ className?: string }>; // Changed to ComponentType
    label: string; 
    adminOnly?: boolean 
  }) => {
    if (adminOnly && !isAdmin) return null;
    return (
      <Link
        to={to}
        onClick={() => isMobile && toggleSidebar()}
        className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
          isActive(to)
            ? 'bg-blue-50 text-blue-600 font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
        aria-current={isActive(to) ? 'page' : undefined}
      >
        <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
        {!isCollapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div className={`relative ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex flex-col h-screen bg-white border-r border-gray-100`}>
      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 w-6 h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 z-10"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
      </button>

      {/* Sidebar Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-gray-100`}>
          {!isCollapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TaskFlow
            </h1>
          )}
        </div>

        {/* User Profile */}
        {!isCollapsed && user ? (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <UserAvatar user={user} className="w-10 h-10" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{getUserDisplayName(user)}</p>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500">{user.email}</span>
                  {isAdmin && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : !isCollapsed && (
          <div className="p-4 border-b border-gray-100 text-gray-500 text-sm">
            User not loaded
          </div>
        )}

        {/* Date Picker */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-100">
            <label htmlFor="datePicker" className="text-sm font-medium text-gray-600 block mb-1">
              Select Date
            </label>
            <input
              type="date"
              id="datePicker"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Task Stats */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-100">
            <div className="mb-2 flex justify-between text-sm text-gray-600">
              <span>Tasks Progress</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                <span>{completedCount} Completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
                <span>{tasksLeft} Pending</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          <NavItem to="/" icon={FiHome as React.ComponentType<{ className?: string }>} label="Tasks" />
          <NavItem to="/dashboard" icon={FiPieChart as React.ComponentType<{ className?: string }>} label="Dashboard" />
          <NavItem to="/reports" icon={FiFileText as React.ComponentType<{ className?: string }>} label="Reports" />
          {isAdmin && (
            <>
              <div className={`${isCollapsed ? 'px-1' : 'px-3'} pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider`}>
                {!isCollapsed && 'Admin'}
              </div>
              <NavItem to="/admin" icon={FiSettings as React.ComponentType<{ className?: string }>} label="Manage Users" adminOnly />
              <NavItem to="/admin/tasks" icon={FiUsers as React.ComponentType<{ className?: string }>} label="Manage Tasks" adminOnly />
            </>
          )}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center' : 'px-3 justify-between'
          } py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors`}
        >
          <FiLogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;