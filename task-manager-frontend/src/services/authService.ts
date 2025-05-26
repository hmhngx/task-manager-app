import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const loginUser = async (username: string, password: string): Promise<string> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    });
    return response.data.access_token;
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