import axios from 'axios';
import { Task, CreateTaskDto, UpdateTaskDto } from '../types';
import { API_CONFIG } from '../config/api.config';

// Create axios instance with auth header
const api = axios.create(API_CONFIG);

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getTasks = async (): Promise<Task[]> => {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch tasks');
  }
};

export const createTask = async (taskData: CreateTaskDto): Promise<Task> => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create task');
  }
};

export const updateTask = async (taskId: string, taskData: UpdateTaskDto): Promise<Task> => {
  try {
    const response = await api.patch(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update task');
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await api.delete(`/tasks/${taskId}`);
  } catch (error) {
    throw new Error('Failed to delete task');
  }
}; 