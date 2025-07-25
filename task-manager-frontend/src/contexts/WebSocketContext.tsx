import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  // Task-related socket methods
  subscribeToTask: (taskId: string) => void;
  unsubscribeFromTask: (taskId: string) => void;
  subscribeToAllTasks: () => void;
  
  // Admin methods
  subscribeToDashboard: () => void;
  subscribeToUserActivity: () => void;
  subscribeToStats: () => void;
  
  // Connection status
  isConnected: boolean;
  connectionError: string | null;
  
  // Socket instances
  taskSocket: Socket | null;
  adminSocket: Socket | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [taskSocket, setTaskSocket] = useState<Socket | null>(null);
  const [adminSocket, setAdminSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize WebSocket connections
  useEffect(() => {
    if (!user || !token) {
      // Clean up existing connections
      if (taskSocket) {
        taskSocket.disconnect();
        setTaskSocket(null);
      }
      if (adminSocket) {
        adminSocket.disconnect();
        setAdminSocket(null);
      }
      setIsConnected(false);
      return;
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

    // Initialize task socket
    const taskSocketInstance = io(`${backendUrl}/tasks`, {
      auth: {
        token: token,
      },
      transports: ['websocket'],
    });

    // Initialize admin socket (only for admin users)
    let adminSocketInstance: Socket | null = null;
    if (user.role === 'admin') {
      adminSocketInstance = io(`${backendUrl}/admin`, {
        auth: {
          token: token,
        },
        transports: ['websocket'],
      });
    }

    // Task socket event handlers
    taskSocketInstance.on('connect', () => {
      console.log('Task WebSocket connected');
      setIsConnected(true);
      setConnectionError(null);
    });

    taskSocketInstance.on('disconnect', () => {
      console.log('Task WebSocket disconnected');
      setIsConnected(false);
    });

    taskSocketInstance.on('connect_error', (error) => {
      console.error('Task WebSocket connection error:', error);
      setConnectionError('Failed to connect to task updates');
    });

    // Admin socket event handlers
    if (adminSocketInstance) {
      adminSocketInstance.on('connect', () => {
        console.log('Admin WebSocket connected');
      });

      adminSocketInstance.on('disconnect', () => {
        console.log('Admin WebSocket disconnected');
      });

      adminSocketInstance.on('connect_error', (error) => {
        console.error('Admin WebSocket connection error:', error);
      });
    }

    setTaskSocket(taskSocketInstance);
    setAdminSocket(adminSocketInstance);

    // Cleanup function
    return () => {
      taskSocketInstance.disconnect();
      if (adminSocketInstance) {
        adminSocketInstance.disconnect();
      }
    };
  }, [user, token]);

  // Task subscription methods
  const subscribeToTask = useCallback((taskId: string) => {
    if (taskSocket && isConnected) {
      taskSocket.emit('subscribe:task', taskId);
    }
  }, [taskSocket, isConnected]);

  const unsubscribeFromTask = useCallback((taskId: string) => {
    if (taskSocket && isConnected) {
      taskSocket.emit('unsubscribe:task', taskId);
    }
  }, [taskSocket, isConnected]);

  const subscribeToAllTasks = useCallback(() => {
    if (taskSocket && isConnected) {
      taskSocket.emit('subscribe:all-tasks');
    }
  }, [taskSocket, isConnected]);

  // Admin subscription methods
  const subscribeToDashboard = useCallback(() => {
    if (adminSocket && isConnected) {
      adminSocket.emit('subscribe:dashboard');
    }
  }, [adminSocket, isConnected]);

  const subscribeToUserActivity = useCallback(() => {
    if (adminSocket && isConnected) {
      adminSocket.emit('subscribe:user-activity');
    }
  }, [adminSocket, isConnected]);

  const subscribeToStats = useCallback(() => {
    if (adminSocket && isConnected) {
      adminSocket.emit('subscribe:stats');
    }
  }, [adminSocket, isConnected]);

  const value: WebSocketContextType = {
    subscribeToTask,
    unsubscribeFromTask,
    subscribeToAllTasks,
    subscribeToDashboard,
    subscribeToUserActivity,
    subscribeToStats,
    isConnected,
    connectionError,
    taskSocket,
    adminSocket,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 