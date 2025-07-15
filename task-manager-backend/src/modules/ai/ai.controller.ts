import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { AiAssistDto } from './dto/ai-assist.dto';

@ApiTags('AI Assistant')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('assist')
  @ApiOperation({ summary: 'Get AI assistance for a task' })
  @ApiResponse({ 
    status: 200, 
    description: 'AI assistance response',
    schema: {
      type: 'object',
      properties: {
        response: { type: 'string' },
        suggestions: { 
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAssistance(
    @Body() aiAssistDto: AiAssistDto,
    @Request() req: any
  ) {
    return this.aiService.getTaskAssistance(aiAssistDto, req.user);
  }

  @Post('test')
  @ApiOperation({ summary: 'Test OpenAI API connection' })
  @ApiResponse({ status: 200, description: 'API connection test successful' })
  @ApiResponse({ status: 400, description: 'API connection test failed' })
  async testConnection() {
    return this.aiService.testConnection();
  }
} 