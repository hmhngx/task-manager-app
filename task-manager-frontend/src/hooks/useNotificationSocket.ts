import { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

interface Notification {
  id: string;
  type: string;
  message: string;
  task?: any;
  timestamp: string;
  read: boolean;
}

interface UseNotificationSocketOptions {
  onNotification?: (notification: Notification) => void;
  onTaskAssigned?: (task: any, assigner: string) => void;
  onStatusChange?: (task: any, oldStatus: string, newStatus: string, updater: string) => void;
  onMention?: (comment: any, taskId: string, author: string) => void;
  onDeadlineApproaching?: (task: any) => void;
  onApprovalRequired?: (task: any, requester: string) => void;
  onSystemNotification?: (message: string, type: string) => void;
}

export const useNotificationSocket = (options: UseNotificationSocketOptions = {}) => {
  const { notificationSocket, subscribeToNotifications } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    onNotification,
    onTaskAssigned,
    onStatusChange,
    onMention,
    onDeadlineApproaching,
    onApprovalRequired,
    onSystemNotification,
  } = options;

  // Subscribe to notifications
  useEffect(() => {
    if (notificationSocket) {
      subscribeToNotifications();
    }
  }, [notificationSocket, subscribeToNotifications]);

  // Handle notification events
  useEffect(() => {
    if (!notificationSocket) return;

    const handleTaskAssigned = (data: { task: any; assigner: string; timestamp: string }) => {
      console.log('Task assigned notification:', data);
      const notification: Notification = {
        id: `task-assigned-${Date.now()}`,
        type: 'task_assigned',
        message: `You have been assigned to task: ${data.task.title}`,
        task: data.task,
        timestamp: data.timestamp,
        read: false,
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      onTaskAssigned?.(data.task, data.assigner);
      onNotification?.(notification);
    };

    const handleStatusChange = (data: { 
      task: any; 
      oldStatus: string; 
      newStatus: string; 
      updater: string; 
      timestamp: string 
    }) => {
      console.log('Status change notification:', data);
      const notification: Notification = {
        id: `status-change-${Date.now()}`,
        type: 'status_change',
        message: `Task "${data.task.title}" status changed from ${data.oldStatus} to ${data.newStatus}`,
        task: data.task,
        timestamp: data.timestamp,
        read: false,
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      onStatusChange?.(data.task, data.oldStatus, data.newStatus, data.updater);
      onNotification?.(notification);
    };

    const handleMention = (data: { 
      comment: any; 
      taskId: string; 
      author: string; 
      timestamp: string 
    }) => {
      console.log('Mention notification:', data);
      const notification: Notification = {
        id: `mention-${Date.now()}`,
        type: 'mention',
        message: `You were mentioned in a comment on task: ${data.comment.task?.title || 'Unknown task'}`,
        task: data.comment.task,
        timestamp: data.timestamp,
        read: false,
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      onMention?.(data.comment, data.taskId, data.author);
      onNotification?.(notification);
    };

    const handleDeadlineApproaching = (data: { task: any; timestamp: string }) => {
      console.log('Deadline approaching notification:', data);
      const notification: Notification = {
        id: `deadline-${Date.now()}`,
        type: 'deadline_approaching',
        message: `Task "${data.task.title}" deadline is approaching`,
        task: data.task,
        timestamp: data.timestamp,
        read: false,
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      onDeadlineApproaching?.(data.task);
      onNotification?.(notification);
    };

    const handleApprovalRequired = (data: { 
      task: any; 
      requester: string; 
      timestamp: string 
    }) => {
      console.log('Approval required notification:', data);
      const notification: Notification = {
        id: `approval-${Date.now()}`,
        type: 'approval_required',
        message: `Approval required for task: ${data.task.title}`,
        task: data.task,
        timestamp: data.timestamp,
        read: false,
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      onApprovalRequired?.(data.task, data.requester);
      onNotification?.(notification);
    };

    const handleSystemNotification = (data: { 
      message: string; 
      type: string; 
      timestamp: string 
    }) => {
      console.log('System notification:', data);
      const notification: Notification = {
        id: `system-${Date.now()}`,
        type: 'system',
        message: data.message,
        timestamp: data.timestamp,
        read: false,
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      onSystemNotification?.(data.message, data.type);
      onNotification?.(notification);
    };

    // Listen for notification events
    notificationSocket.on('notification:task_assigned', handleTaskAssigned);
    notificationSocket.on('notification:status_change', handleStatusChange);
    notificationSocket.on('notification:mention', handleMention);
    notificationSocket.on('notification:deadline_approaching', handleDeadlineApproaching);
    notificationSocket.on('notification:approval_required', handleApprovalRequired);
    notificationSocket.on('notification:system', handleSystemNotification);

    return () => {
      notificationSocket.off('notification:task_assigned', handleTaskAssigned);
      notificationSocket.off('notification:status_change', handleStatusChange);
      notificationSocket.off('notification:mention', handleMention);
      notificationSocket.off('notification:deadline_approaching', handleDeadlineApproaching);
      notificationSocket.off('notification:approval_required', handleApprovalRequired);
      notificationSocket.off('notification:system', handleSystemNotification);
    };
  }, [notificationSocket, onTaskAssigned, onStatusChange, onMention, onDeadlineApproaching, onApprovalRequired, onSystemNotification, onNotification]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
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
    isConnected: !!notificationSocket?.connected,
  };
}; 