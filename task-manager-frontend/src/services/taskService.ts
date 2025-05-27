import { Task, TaskStats, CreateTaskDto, UpdateTaskDto } from '../types';
import { API_URL } from '../config';
import { getStoredToken, logoutUser } from './authService';

const getAuthHeaders = () => {
  const token = getStoredToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const handleResponse = async (response: Response) => {
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  if (response.status === 401) {
    console.log('401 error - clearing token');
    logoutUser();
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error('Request failed');
  }
  return response.json();
};

export const getTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_URL}/tasks`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
};

export const createTask = async (task: CreateTaskDto): Promise<Task> => {
  // Validate task data before sending
  if (!task.title || !task.description || !task.deadline) {
    throw new Error('Missing required fields');
  }

  // Ensure deadline is a valid Date object
  if (!(task.deadline instanceof Date) || isNaN(task.deadline.getTime())) {
    throw new Error('Invalid deadline date');
  }

  const taskData = {
    ...task,
    deadline: task.deadline.toISOString() // Convert Date to ISO string for API
  };

  console.log('Creating task with data:', JSON.stringify(taskData, null, 2));
  console.log('Auth headers:', getAuthHeaders());
  
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create task:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        requestData: taskData
      });
      throw new Error(`Failed to create task: ${errorText}`);
    }

    const createdTask = await response.json();
    return {
      ...createdTask,
      deadline: new Date(createdTask.deadline),
      createdAt: new Date(createdTask.createdAt),
      updatedAt: new Date(createdTask.updatedAt)
    };
  } catch (error) {
    console.error('Error in createTask:', error);
    throw error;
  }
};

export const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  return response.json();
};

export const deleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
};

export const getWeeklyStats = async (): Promise<TaskStats> => {
  console.log('Fetching weekly stats...');
  const response = await fetch(`${API_URL}/tasks/stats/weekly`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getMonthlyStats = async (): Promise<TaskStats> => {
  console.log('Fetching monthly stats...');
  const response = await fetch(`${API_URL}/tasks/stats/monthly`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}; 