import { IsString, IsOptional, IsDate, IsEnum, IsArray, IsMongoId, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskType, TaskPriority } from '../schemas/task.schema';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  deadline?: Date;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsMongoId()
  @IsOptional()
  assignee?: string;

  @IsMongoId()
  @IsOptional()
  parentTask?: string;

  @IsMongoId()
  @IsOptional()
  workflow?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;
}
