import { Controller, Get, Query } from '@nestjs/common';
import { DataService } from './data.service';
import { QueryFilterDto } from './dto/query-filter.dto';

@Controller('api/data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get()
  async getData(@Query() filters: QueryFilterDto) {
    const data = await this.dataService.query(filters);
    return {
      count: data.length,
      data,
    };
  }

  @Get('sources')
  async getSources() {
    return this.dataService.getSources();
  }

  @Get('stats')
  async getStats() {
    return this.dataService.getStats();
  }
}

