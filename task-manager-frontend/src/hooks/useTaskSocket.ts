import { useEffect, useCallback } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { Task } from '../types/Task';
import { useAppDispatch } from '../store';
import { updateTask, addTask, removeTask } from '../store/tasksSlice';

interface UseTaskSocketOptions {
  taskId?: string;
  onTaskUpdate?: (task: Task) => void;
  onTaskCreated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
  onStatusChange?: (taskId: string, oldStatus: string, newStatus: string) => void;
  onAssignment?: (taskId: string, assigneeId: string, assignerId: string) => void;
}

export const useTaskSocket = (options: UseTaskSocketOptions = {}) => {
  const { taskSocket, subscribeToTask, unsubscribeFromTask, subscribeToAllTasks } = useWebSocket();
  const dispatch = useAppDispatch();

  const {
    taskId,
    onTaskUpdate,
    onTaskCreated,
    onTaskDeleted,
    onStatusChange,
    onAssignment,
  } = options;

  // Subscribe to specific task updates
  useEffect(() => {
    if (taskId && taskSocket) {
      subscribeToTask(taskId);
      return () => unsubscribeFromTask(taskId);
    }
  }, [taskId, taskSocket, subscribeToTask, unsubscribeFromTask]);

  // Subscribe to all tasks (for admin dashboard)
  useEffect(() => {
    if (!taskId && taskSocket) {
      subscribeToAllTasks();
    }
  }, [taskId, taskSocket, subscribeToAllTasks]);

  // Handle task update events
  useEffect(() => {
    if (!taskSocket) return;

    const handleTaskUpdated = (data: { task: Task; updater: string; changes: any; timestamp: string }) => {
      console.log('Task updated via WebSocket:', data);
      dispatch(updateTask(data.task));
      onTaskUpdate?.(data.task);
    };

    const handleTaskCreated = (data: { task: Task; creator: string; timestamp: string }) => {
      console.log('Task created via WebSocket:', data);
      dispatch(addTask(data.task));
      onTaskCreated?.(data.task);
    };

    const handleTaskDeleted = (data: { taskId: string; deleter: string; timestamp: string }) => {
      console.log('Task deleted via WebSocket:', data);
      dispatch(removeTask(data.taskId));
      onTaskDeleted?.(data.taskId);
    };

    const handleTaskStatusChanged = (data: { 
      task: Task; 
      oldStatus: string; 
      newStatus: string; 
      updater: string; 
      timestamp: string 
    }) => {
      console.log('Task status changed via WebSocket:', data);
      dispatch(updateTask(data.task));
      onStatusChange?.(data.task._id || data.task.id, data.oldStatus, data.newStatus);
    };

    const handleTaskAssigned = (data: { 
      task: Task; 
      assignee: string; 
      assigner: string; 
      timestamp: string 
    }) => {
      console.log('Task assigned via WebSocket:', data);
      dispatch(updateTask(data.task));
      onAssignment?.(data.task._id || data.task.id, data.assignee, data.assigner);
    };

    // Listen for task events
    taskSocket.on('task:updated', handleTaskUpdated);
    taskSocket.on('task:created', handleTaskCreated);
    taskSocket.on('task:deleted', handleTaskDeleted);
    taskSocket.on('task:status_changed', handleTaskStatusChanged);
    taskSocket.on('task:assigned', handleTaskAssigned);

    return () => {
      taskSocket.off('task:updated', handleTaskUpdated);
      taskSocket.off('task:created', handleTaskCreated);
      taskSocket.off('task:deleted', handleTaskDeleted);
      taskSocket.off('task:status_changed', handleTaskStatusChanged);
      taskSocket.off('task:assigned', handleTaskAssigned);
    };
  }, [taskSocket, dispatch, onTaskUpdate, onTaskCreated, onTaskDeleted, onStatusChange, onAssignment]);

  return {
    isConnected: !!taskSocket?.connected,
  };
}; 