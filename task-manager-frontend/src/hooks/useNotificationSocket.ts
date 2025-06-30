import { useEffect, useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface UseNotificationSocketOptions {
  onNotification?: (notification: Notification) => void;
}

export const useNotificationSocket = (options: UseNotificationSocketOptions = {}) => {
  const { socket, subscribeToNotifications } = useNotification();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { onNotification } = options;

  useEffect(() => {
    if (socket) {
      subscribeToNotifications();
    }
  }, [socket, subscribeToNotifications]);

  const handleNewNotification = useCallback((notification: Notification) => {
    console.log('New notification received:', notification);
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
    onNotification?.(notification);
  }, [onNotification]);

  useEffect(() => {
    if (!socket) return;

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket, handleNewNotification]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification => {
        if (notification.id === notificationId && !notification.read) {
          setUnreadCount(current => Math.max(0, current - 1));
          return { ...notification, read: true };
        }
        return notification;
      })
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    isConnected: !!socket?.connected,
  };
}; 