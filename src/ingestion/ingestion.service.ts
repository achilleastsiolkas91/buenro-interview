import { Injectable, Logger } from '@nestjs/common';
import { DataService } from '../data/data.service';
import axios from 'axios';

export interface DataSource {
  name: string;
  url: string;
  type: string;
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private readonly dataService: DataService) {}

  /**
   * Ingest data from all configured sources
   */
  async ingestAll(): Promise<void> {
    this.logger.log('Starting data ingestion...');

    const sources = await this.getDataSources();
    
    for (const source of sources) {
      try {
        await this.ingest(source);
      } catch (error) {
        this.logger.error(`Error ingesting ${source.name}: ${error.message}`);
      }
    }

    this.logger.log('Data ingestion completed');
  }

  /**
   * Ingest data from a specific source
   */
  async ingest(source: DataSource): Promise<void> {
    this.logger.log(`Ingesting data from ${source.name} (${source.url})...`);

    try {
      // Fetch data from S3 URL
      this.logger.log(`Fetching data from ${source.url}...`);
      const response = await axios.get(source.url, {
        responseType: 'json',
        timeout: 300000, // 5 minutes timeout for large files
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      const jsonData = response.data;
      this.logger.log(`Successfully fetched data from ${source.name}`);

      // Handle both array and object responses
      const items = Array.isArray(jsonData) ? jsonData : [jsonData];

      let processedCount = 0;
      for (const item of items) {
        await this.dataService.createOrUpdate(
          item.id?.toString(),
          source.name,
          item,
        );
        processedCount++;
      }

      this.logger.log(`Successfully processed ${processedCount} items from ${source.name}`);
    } catch (error) {
      this.logger.error(`Error processing ${source.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all configured data sources from S3
   * To add a new source, simply add a new entry to this array
   */
  private async getDataSources(): Promise<DataSource[]> {
    return [
      {
        name: 'source1',
        url: 'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/structured_generated_data.json',
        type: 'json',
      },
      {
        name: 'source2',
        url: 'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/large_generated_data.json',
        type: 'json',
      },
      // Add new source here, example:
      // {
      //   name: 'source3',
      //   url: 'https://your-bucket.s3.amazonaws.com/your-file.json',
      //   type: 'json',
      // },
    ];
  }

}

