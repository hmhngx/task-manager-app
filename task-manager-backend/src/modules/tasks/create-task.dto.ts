import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
