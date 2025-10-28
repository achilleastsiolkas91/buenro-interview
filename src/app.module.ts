import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { DataModule } from './data/data.module';
import { IngestionModule } from './ingestion/ingestion.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: any) => ({
        uri: configService.get('MONGODB_URI') || 'mongodb://localhost:27017/buenro',
      }),
      inject: ['ConfigService'],
    }),
    ScheduleModule.forRoot(),
    DataModule,
    IngestionModule,
  ],
})
export class AppModule {}

