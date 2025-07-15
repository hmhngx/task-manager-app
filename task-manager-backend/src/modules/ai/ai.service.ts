import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AiAssistDto } from './dto/ai-assist.dto';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openaiApiKey: string;
  private readonly openaiApiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.logger.log(`OpenAI API Key loaded: ${this.openaiApiKey ? 'Yes' : 'No'}`);
    if (this.openaiApiKey) {
      this.logger.log(`API Key starts with: ${this.openaiApiKey.substring(0, 7)}...`);
    } else {
      this.logger.warn('OPENAI_API_KEY not found in environment variables');
    }
  }

  async getTaskAssistance(aiAssistDto: AiAssistDto, user: any) {
    if (!this.openaiApiKey) {
      throw new BadRequestException(
        'AI service is not configured. Please set OPENAI_API_KEY environment variable. ' +
        'Get your API key from https://platform.openai.com/api-keys'
      );
    }

    const prompt = this.buildPrompt(aiAssistDto, user);
    this.logger.log(`[AI REQUEST] User: ${user?.email || user?.id || 'unknown'} | Prompt: ${prompt}`);

    try {
      const response = await this.callOpenAI(prompt, aiAssistDto, user);
      // Parse the response to extract suggestions
      const suggestions = this.extractSuggestions(response);
      return {
        response,
        suggestions,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('[AI ERROR] getTaskAssistance failed', {
        error: error,
        user,
        aiAssistDto,
        prompt,
        stack: error?.stack,
      });
      if (error instanceof BadRequestException || error.message !== 'Failed to get AI assistance') {
        throw error;
      }
      throw new BadRequestException(
        `AI assistance failed: ${error.message || 'Unknown error occurred'}`
      );
    }
  }

  private buildPrompt(aiAssistDto: AiAssistDto, user: any): string {
    const { taskTitle, taskDescription, question } = aiAssistDto;
    return `You are a productivity and task management expert. A user is working on a task and needs your assistance.\n\nTask Information:\n- Title: ${taskTitle}\n${taskDescription ? `- Description: ${taskDescription}` : ''}\n- User Question: ${question}\n\nPlease provide:\n1. A helpful response to their specific question\n2. 3-5 actionable suggestions for improving productivity and task completion\n3. Time management tips if relevant\n4. Best practices for this type of task\n\nFocus on practical, actionable advice that can help them complete the task more efficiently. Be encouraging and supportive.\n\nFormat your response as a natural conversation, and end with a numbered list of specific suggestions.`;
  }

  private async callOpenAI(prompt: string, aiAssistDto?: AiAssistDto, user?: any): Promise<string> {
    try {
      const requestData = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful productivity assistant that provides practical advice for task management and completion.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      };
      this.logger.debug('[AI REQUEST] OpenAI request data', requestData);
      const response = await axios.post<OpenAIResponse>(
        this.openaiApiUrl,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      this.logger.debug('[AI RESPONSE] OpenAI response', response.data);
      return response.data.choices[0]?.message?.content || 'No response from AI';
    } catch (error: any) {
      this.logger.error('[AI ERROR] callOpenAI failed', {
        error: error,
        errorData: error?.response?.data,
        errorStatus: error?.response?.status,
        errorHeaders: error?.response?.headers,
        requestData: prompt,
        aiAssistDto,
        user,
        stack: error?.stack,
      });
      if (error.response?.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
      } else if (error.response?.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 400) {
        throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || 'Bad request'}`);
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Network error: Unable to connect to OpenAI API. Please check your internet connection.');
      } else {
        throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
      }
    }
  }

  private extractSuggestions(response: string): string[] {
    // Extract numbered suggestions from the response
    const suggestions: string[] = [];
    const lines = response.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (/^\d+\./.test(trimmedLine)) {
        const suggestion = trimmedLine.replace(/^\d+\.\s*/, '').trim();
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    }
    return suggestions.slice(0, 5); // Return max 5 suggestions
  }

  async testConnection() {
    if (!this.openaiApiKey) {
      throw new BadRequestException(
        'AI service is not configured. Please set OPENAI_API_KEY environment variable.'
      );
    }
    try {
      const response = await axios.post<OpenAIResponse>(
        this.openaiApiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a test message.'
            }
          ],
          max_tokens: 10,
          temperature: 0.1,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      this.logger.debug('[AI TEST] OpenAI test response', response.data);
      return {
        success: true,
        message: 'OpenAI API connection successful',
        response: response.data.choices[0]?.message?.content || 'Test response received'
      };
    } catch (error: any) {
      this.logger.error('[AI ERROR] testConnection failed', {
        error: error,
        errorData: error?.response?.data,
        errorStatus: error?.response?.status,
        errorHeaders: error?.response?.headers,
        stack: error?.stack,
      });
      throw new BadRequestException(
        `OpenAI API test failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }
} 