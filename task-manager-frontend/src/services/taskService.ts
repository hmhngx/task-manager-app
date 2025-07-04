import axios from 'axios';
import { Task, TaskStats, CreateTaskDto, UpdateTaskDto, Comment, Attachment } from '../types/Task';
import { getStoredToken, logoutUser } from './authService';
import { API_URL } from '../config';

const getAuthHeader = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getTasks = async (): Promise<Task[]> => {
  try {
    const response = await axios.get(`${API_URL}/tasks`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const createTask = async (task: CreateTaskDto): Promise<Task> => {
  try {
    const response = await axios.post(`${API_URL}/tasks`, task, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const updateTask = async (
  id: string,
  task: UpdateTaskDto
): Promise<Task> => {
  try {
    const response = await axios.patch(`${API_URL}/tasks/${id}`, task, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/tasks/${id}`, {
      headers: getAuthHeader(),
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getWeeklyStats = async (): Promise<TaskStats> => {
  try {
    const response = await axios.get(`${API_URL}/tasks/stats/weekly`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getWeeklyStatsDetailed = async (): Promise<{
  currentStatus: TaskStats;
  weeklyActivity: {
    created: number;
    completed: number;
    updated: number;
  };
}> => {
  try {
    const response = await axios.get(`${API_URL}/tasks/stats/weekly/detailed`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getMonthlyStats = async (): Promise<TaskStats> => {
  try {
    const response = await axios.get(`${API_URL}/tasks/stats/monthly`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getAllTasks = async (): Promise<Task[]> => {
  try {
    const response = await axios.get(`${API_URL}/tasks`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getAllTasksWithFilters = async (filters: any = {}): Promise<Task[]> => {
  try {
    const response = await axios.get(`${API_URL}/tasks`, { 
      params: filters,
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getMyTasks = async (): Promise<Task[]> => {
  try {
    const response = await axios.get(`${API_URL}/tasks/my-tasks`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getCreatedByMe = async (): Promise<Task[]> => {
  try {
    const response = await axios.get(`${API_URL}/tasks/created-by-me`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getTasksByStatus = async (status: string): Promise<Task[]> => {
  try {
    const response = await axios.get(`${API_URL}/tasks/status/${status}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getTasksByPriority = async (priority: string): Promise<Task[]> => {
  try {
    const response = await axios.get(`${API_URL}/tasks/priority/${priority}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getTasksByType = async (type: string): Promise<Task[]> => {
  try {
    const response = await axios.get(`${API_URL}/tasks/type/${type}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getTaskById = async (id: string): Promise<Task> => {
  try {
    const response = await axios.get(`${API_URL}/tasks/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getTaskComments = async (taskId: string): Promise<Comment[]> => {
  try {
    const response = await axios.get(`${API_URL}/tasks/${taskId}/comments`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const createComment = async (taskId: string, content: string, mentions: string[] = [], parentCommentId?: string): Promise<Comment> => {
  try {
    console.log('Sending createComment request:', {
      taskId,
      content,
      mentions,
      parentCommentId
    });
    
    const response = await axios.post(`${API_URL}/tasks/${taskId}/comments`, {
      content,
      mentions,
      parentCommentId,
    }, {
      headers: getAuthHeader(),
    });
    
    console.log('createComment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('createComment error:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const updateComment = async (commentId: string, content: string): Promise<Comment> => {
  try {
    const response = await axios.patch(`${API_URL}/tasks/comments/${commentId}`, { 
      content,
    }, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/tasks/comments/${commentId}`, {
      headers: getAuthHeader(),
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const voteComment = async (commentId: string, voteType: 'up' | 'down'): Promise<Comment> => {
  try {
    const response = await axios.post(`${API_URL}/tasks/comments/${commentId}/vote`, {
      voteType,
    }, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getTaskAttachments = async (taskId: string): Promise<Attachment[]> => {
  try {
    const response = await axios.get(`${API_URL}/tasks/${taskId}/attachments`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const uploadAttachment = async (taskId: string, file: File): Promise<Attachment> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/tasks/${taskId}/attachments`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const deleteAttachment = async (attachmentId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/tasks/attachments/${attachmentId}`, {
      headers: getAuthHeader(),
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const requestTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/request`, {}, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const approveRequest = async (taskId: string, requesterId: string): Promise<Task> => {
  try {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/approve/${requesterId}`, {}, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const rejectRequest = async (taskId: string, requesterId: string): Promise<Task> => {
  try {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/reject/${requesterId}`, {}, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const addWatcher = async (taskId: string): Promise<Task> => {
  try {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/watchers`, {}, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const removeWatcher = async (taskId: string): Promise<Task> => {
  try {
    const response = await axios.delete(`${API_URL}/tasks/${taskId}/watchers`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getTaskStats = async (): Promise<TaskStats> => {
  try {
    const response = await axios.get(`${API_URL}/tasks/stats`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getAvailableUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/available`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logoutUser();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const downloadAttachment = async (attachmentId: string): Promise<{ blob: Blob; filename: string; mimeType: string }> => {
  const token = getStoredToken();
  const response = await fetch(`${API_URL}/tasks/attachments/${attachmentId}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error('Failed to download attachment');
  }
  // Try to get filename from Content-Disposition header
  let filename = 'downloaded-file';
  const disposition = response.headers.get('Content-Disposition');
  if (disposition) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match) filename = match[1];
  }
  const mimeType = response.headers.get('Content-Type') || 'application/octet-stream';
  const blob = await response.blob();
  return { blob, filename, mimeType };
};

/**
 * Check if a task can be requested based on its status
 * @param task - The task to check
 * @returns true if the task can be requested, false otherwise
 */
export const canRequestTask = (task: Task): boolean => {
  return task.status !== 'done' && task.status !== 'late';
};

/**
 * Get a user-friendly message explaining why a task cannot be requested
 * @param task - The task to check
 * @returns A message explaining why the task cannot be requested, or null if it can be requested
 */
export const getTaskRequestRestrictionMessage = (task: Task): string | null => {
  if (task.status === 'done') {
    return 'Cannot request a task that is done. Only tasks in "todo" or "in_progress" status can be requested.';
  }
  if (task.status === 'late') {
    return 'Cannot request a task that is late. Only tasks in "todo" or "in_progress" status can be requested.';
  }
  return null;
};

const taskService = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getWeeklyStats,
  getWeeklyStatsDetailed,
  getMonthlyStats,
  getAllTasks,
  getAllTasksWithFilters,
  getMyTasks,
  getCreatedByMe,
  getTasksByStatus,
  getTasksByPriority,
  getTasksByType,
  getTaskById,
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
  getTaskAttachments,
  uploadAttachment,
  deleteAttachment,
  requestTask,
  approveRequest,
  rejectRequest,
  addWatcher,
  removeWatcher,
  getTaskStats,
  getAvailableUsers,
  downloadAttachment,
  canRequestTask,
  getTaskRequestRestrictionMessage,
};

export default taskService;
