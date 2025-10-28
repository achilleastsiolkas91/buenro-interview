import { Controller, Post } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

@Controller('api/ingest')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  async triggerIngestion() {
    await this.ingestionService.ingestAll();
    return { message: 'Ingestion completed' };
  }
}

