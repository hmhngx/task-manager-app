import React, { useState } from 'react';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: Date | string;
    read: boolean;
    priority?: string;
    data?: any;
  };
  onMarkAsRead: (id: string) => void;
  onClear: (id: string) => void;
  onViewTask?: (taskId: string) => void;
  getNotificationIcon: (type: string) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClear,
  onViewTask,
  getNotificationIcon,
  getPriorityColor,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleMarkAsRead = async () => {
    if (isMarkingAsRead) return;
    setIsMarkingAsRead(true);
    try {
      await onMarkAsRead(notification.id);
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  const handleClear = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      await onClear(notification.id);
    } finally {
      setIsClearing(false);
    }
  };

  const handleViewTask = () => {
    if (notification.data?.taskId && onViewTask) {
      onViewTask(notification.data.taskId);
    }
  };

  const baseClasses = `
    relative p-4 border-l-4 transition-all duration-300 ease-in-out
    transform hover:scale-[1.02] hover:shadow-lg
    ${getPriorityColor(notification.priority || 'low')}
    ${!notification.read ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-white hover:bg-gray-50'}
    ${isHovered ? 'shadow-md' : 'shadow-sm'}
  `;

  const actionButtonClasses = `
    p-2 rounded-lg transition-all duration-200
    transform hover:scale-110 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const markAsReadButtonClasses = `
    ${actionButtonClasses}
    ${!notification.read 
      ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-100 focus:ring-blue-500' 
      : 'text-gray-400 cursor-not-allowed'
    }
  `;

  const clearButtonClasses = `
    ${actionButtonClasses}
    text-gray-500 hover:text-red-600 hover:bg-red-50 focus:ring-red-500
  `;

  const viewTaskButtonClasses = `
    mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium
    bg-gradient-to-r from-blue-500 to-blue-600 text-white
    rounded-lg hover:from-blue-600 hover:to-blue-700
    transition-all duration-200 transform hover:scale-105
    shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `;

  return (
    <div
      className={baseClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 hover:opacity-5 rounded-r-lg transition-opacity duration-300 pointer-events-none" />
      
      {/* Priority indicator glow */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${
        notification.priority === 'urgent' ? 'from-red-400 to-red-600' :
        notification.priority === 'high' ? 'from-orange-400 to-orange-600' :
        notification.priority === 'medium' ? 'from-blue-400 to-blue-600' :
        'from-gray-400 to-gray-600'
      } opacity-0 hover:opacity-100 transition-opacity duration-300`} />

      <div className="flex items-start space-x-3 relative z-10">
        {/* Icon with animation */}
        <div className="flex-shrink-0 mt-1">
          <div className={`
            p-2 rounded-lg transition-all duration-200
            ${isHovered ? 'scale-110' : 'scale-100'}
            ${!notification.read ? 'bg-blue-100' : 'bg-gray-100'}
            ${isHovered && !notification.read ? 'bg-blue-200' : ''}
          `}>
            {getNotificationIcon(notification.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Title with unread indicator */}
              <div className="flex items-center space-x-2">
                <p className={`text-sm font-semibold transition-colors duration-200 ${
                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {notification.title}
                </p>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Message */}
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {notification.message}
              </p>

                             {/* Timestamp */}
               <p className="text-xs text-gray-400 mt-2 flex items-center space-x-1">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 <span>
                   {notification.timestamp instanceof Date 
                     ? notification.timestamp.toLocaleString()
                     : new Date(notification.timestamp).toLocaleString()
                   }
                 </span>
               </p>

              {/* View Task Button */}
              {notification.data?.taskId && (
                <button
                  onClick={handleViewTask}
                  className={viewTaskButtonClasses}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Task
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 ml-2">
              {/* Mark as Read Button */}
              {!notification.read && (
                <button
                  onClick={handleMarkAsRead}
                  disabled={isMarkingAsRead}
                  className={markAsReadButtonClasses}
                  title="Mark as read"
                >
                  {isMarkingAsRead ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )}

              {/* Clear Button */}
              <button
                onClick={handleClear}
                disabled={isClearing}
                className={clearButtonClasses}
                title="Clear notification"
              >
                {isClearing ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unread indicator line */}
      {!notification.read && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  );
};

export default NotificationItem; 