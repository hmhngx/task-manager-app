import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from './AuthContext';
import { addNotification, markAsRead } from '../store/notificationSlice';
import { RootState } from '../store';
import { NotificationPayload } from '../shared/interfaces/notification.interface';

interface NotificationContextType {
  isConnected: boolean;
  connectionError: string | null;
  subscribeToNotifications: () => void;
  markNotificationAsRead: (notificationId: string) => void;
  socket: Socket | null;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
    const notificationSocket = io(`${backendUrl}/notifications`, {
      auth: {
        token: token,
      },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    notificationSocket.on('connect', () => {
      console.log('Notification WebSocket connected');
      console.log('Socket ID:', notificationSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      
      // Subscribe to notifications
      notificationSocket.emit('subscribe:notifications');
      console.log('Subscribed to notifications');
    });

    notificationSocket.on('disconnect', (reason) => {
      console.log('Notification WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    notificationSocket.on('connect_error', (error) => {
      console.error('Notification WebSocket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      setConnectionError('Failed to connect to notifications');
      setIsConnected(false);
    });

    notificationSocket.on('reconnect', (attemptNumber) => {
      console.log(`Notification WebSocket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionError(null);
      
      // Resubscribe to notifications
      notificationSocket.emit('subscribe:notifications');
    });

    notificationSocket.on('reconnect_error', (error) => {
      console.error('Notification WebSocket reconnection error:', error);
      setConnectionError('Failed to reconnect to notifications');
    });

    notificationSocket.on('reconnect_failed', () => {
      console.error('Notification WebSocket reconnection failed');
      setConnectionError('Failed to reconnect to notifications after multiple attempts');
    });

    // Handle incoming notifications
    notificationSocket.on('notification', (notification: NotificationPayload) => {
      console.log('🔔 Received notification:', notification);
      console.log('📋 Notification type:', notification.type);
      console.log('📝 Notification title:', notification.title);
      console.log('💬 Notification message:', notification.message);
      console.log('📊 Notification data:', notification.data);
      console.log('🆔 Notification ID:', notification.id);
      console.log('📅 Notification timestamp:', notification.timestamp);
      console.log('📤 Dispatching to Redux store...');
      dispatch(addNotification(notification));
      console.log('✅ Notification dispatched successfully');
    });

    setSocket(notificationSocket);

    // Cleanup function
    return () => {
      notificationSocket.disconnect();
    };
  }, [user, token, dispatch]);

  const subscribeToNotifications = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('subscribe:notifications');
    }
  }, [socket, isConnected]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    if (socket && isConnected) {
      socket.emit('mark:read', notificationId);
      dispatch(markAsRead(notificationId));
    }
  }, [socket, isConnected, dispatch]);

  const value: NotificationContextType = {
    isConnected,
    connectionError,
    subscribeToNotifications,
    markNotificationAsRead,
    socket,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 