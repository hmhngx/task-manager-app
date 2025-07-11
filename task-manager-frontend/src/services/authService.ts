import axios from 'axios';
import { User } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
      email,
      password,
    });
    const { access_token, refresh_token, user } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Login failed');
  }
};

export const registerUser = async (
  email: string,
  password: string,
  username?: string
): Promise<User> => {
  try {
    const response = await axios.post<LoginResponse>(
      `${API_URL}/auth/register`,
      {
        email,
        password,
        username,
      }
    );
    const { access_token, refresh_token, user } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Registration failed');
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await axios.post(`${API_URL}/auth/forgot-password`, {
      email,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to send password reset email');
  }
};

export const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
): Promise<void> => {
  try {
    await axios.post(`${API_URL}/auth/reset-password`, {
      email,
      token,
      newPassword,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to reset password');
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
};
