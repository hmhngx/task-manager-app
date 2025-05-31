import axios from 'axios';
import { Task, TaskStats, CreateTaskDto, UpdateTaskDto } from '../types';
import { getStoredToken, logoutUser } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const getAuthHeader = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  console.log('Response status:', response.status);
  console.log(
    'Response headers:',
    Object.fromEntries(response.headers.entries())
  );
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
    const response = await axios.get(`${API_URL}/tasks/all`, {
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
