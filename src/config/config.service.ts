export class ConfigService {
  private config: Record<string, string>;

  constructor() {
    this.config = {
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/buenro',
      PORT: process.env.PORT || '3000',
      INGESTION_INTERVAL: process.env.INGESTION_INTERVAL || '60000', // 1 minute default
    };
  }

  get(key: string): string {
    return this.config[key] || process.env[key];
  }
}

