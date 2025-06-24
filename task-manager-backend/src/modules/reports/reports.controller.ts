import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('tasks')
  async getFilteredTasks(
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
    @Query('type') type?: string,
  ) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    return this.reportsService.getFilteredTasks(startDate, endDate, type);
  }
}
