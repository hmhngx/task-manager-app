import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AiAssistDto {
  @IsString()
  @IsNotEmpty()
  taskTitle: string;

  @IsString()
  @IsOptional()
  taskDescription?: string;

  @IsString()
  @IsNotEmpty()
  question: string;
} 