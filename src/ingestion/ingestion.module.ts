import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { IngestionScheduler } from './ingestion.scheduler';
import { DataModule } from '../data/data.module';

@Module({
  imports: [DataModule],
  controllers: [IngestionController],
  providers: [IngestionService, IngestionScheduler],
  exports: [IngestionService],
})
export class IngestionModule {}

