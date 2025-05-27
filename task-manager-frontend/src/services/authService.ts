import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
  };
}

export const loginUser = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
      username,
      password,
    });
    const { access_token, user } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  } catch (error) {
    throw new Error('Login failed');
  }
};

export const registerUser = async (username: string, password: string): Promise<void> => {
  try {
    await axios.post(`${API_URL}/auth/register`, {
      username,
      password,
    });
  } catch (error) {
    throw new Error('Registration failed');
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
}; 