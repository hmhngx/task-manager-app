import React, { useEffect, useState, useCallback } from 'react';
import { useNotificationSocket, Notification } from '../hooks/useNotificationSocket';

interface NotificationToastProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const NotificationToast: React.FC<NotificationToastProps> = ({ position = 'top-right' }) => {
  const [toastQueue, setToastQueue] = useState<Notification[]>([]);

  const handleNewNotification = useCallback((notification: Notification) => {
    setToastQueue(prev => [...prev, notification]);
    setTimeout(() => {
      setToastQueue(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const { notifications, unreadCount, markAsRead } = useNotificationSocket({
    onNotification: handleNewNotification,
  });

  const [showDropdown, setShowDropdown] = useState(false);

  const removeToast = (id: string) => {
    setToastQueue(prev => prev.filter(n => n.id !== id));
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const getPriorityStyles = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-yellow-400 bg-yellow-50';
      case 'urgent': return 'border-red-500 bg-red-50';
      default: return 'border-blue-400 bg-blue-50';
    }
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 flex flex-col items-end`}>
      {/* Toasts Area */}
      <div className="mb-4 space-y-2">
        {toastQueue.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center p-4 w-full max-w-xs text-gray-700 bg-white rounded-lg shadow-lg border-l-4 ${getPriorityStyles(toast.priority)}`}
            role="alert"
          >
            <div className="ml-3 text-sm font-normal">
              <div className="font-bold text-gray-900">{toast.title}</div>
              <div>{toast.message}</div>
            </div>
            <button
              type="button"
              className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v4.5l2.25 2.25a.75.75 0 0 1-.75 1.25H3a.75.75 0 0 1-.75-.75L4.5 14.25V9.75a6 6 0 0 1 6-6z"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-600">{notifications.length} total</p>
            </div>
            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v4.5l2.25 2.25a.75.75 0 0 1-.75 1.25H3a.75.75 0 0 1-.75-.75L4.5 14.25V9.75a6 6 0 0 1 6-6z"
                    />
                  </svg>
                  <p>No notifications yet.</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-bold">{notification.title}</p>
                      {!notification.read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                    </div>
                    <p className="text-sm text-gray-700">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationToast; 