import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

export interface AiAssistRequest {
  taskTitle: string;
  taskDescription?: string;
  question: string;
}

export interface AiAssistResponse {
  response: string;
  suggestions: string[];
  timestamp: string;
}

class AiService {
  private api = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers,
  });

  // Add auth token to requests
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getTaskAssistance(request: AiAssistRequest): Promise<AiAssistResponse> {
    try {
      const response = await this.api.post('/ai/assist', request, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting AI assistance:', error);
      throw new Error(error.response?.data?.message || 'Failed to get AI assistance');
    }
  }
}

const aiService = new AiService();
export default aiService; 