import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IngestionService } from './ingestion.service';

@Injectable()
export class IngestionScheduler {
  private readonly logger = new Logger(IngestionScheduler.name);

  constructor(private readonly ingestionService: IngestionService) {}

  /**
   * Run ingestion every 5 minutes
   * In production, adjust the schedule as needed (e.g., hourly, daily)
   */
  @Cron('*/5 * * * *')
  async handleIngestion() {
    this.logger.log('Scheduled ingestion triggered');
    
    try {
      await this.ingestionService.ingestAll();
      this.logger.log('Scheduled ingestion completed successfully');
    } catch (error) {
      this.logger.error(`Scheduled ingestion failed: ${error.message}`);
    }
  }
}

