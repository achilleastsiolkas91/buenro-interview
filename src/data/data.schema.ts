import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DataDocument = Data & Document;

/**
 * Unified schema that can handle both data sources
 * Uses a flexible structure with metadata about the source
 */
@Schema({ timestamps: true })
export class Data {
  // Original ID from source
  @Prop({ required: true, index: true })
  originalId: string;

  // Source identifier (e.g., 'source1', 'source2')
  @Prop({ required: true, index: true })
  source: string;

  // Unified fields that can accommodate both schemas
  @Prop({ type: Object })
  name?: string;

  @Prop({ type: Object })
  city?: string;

  @Prop({ type: Object })
  country?: string;

  @Prop({ type: Object })
  address?: {
    country?: string;
    city?: string;
  };

  // Availability field - can be boolean or string
  @Prop({ type: String })
  availability?: string;

  @Prop({ index: true })
  isAvailable?: boolean;

  // Price fields
  @Prop({ type: Number, index: true })
  priceForNight?: number;

  @Prop({ type: Number, index: true })
  pricePerNight?: number;

  // Additional fields
  @Prop({ type: String, index: true })
  priceSegment?: string;

  // Store the complete raw JSON for reference
  @Prop({ type: Object })
  rawData: any;

  // Timestamps are automatically added by Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

export const DataSchema = SchemaFactory.createForClass(Data);

// Create compound indexes for common queries
DataSchema.index({ source: 1, city: 1 });
DataSchema.index({ source: 1, originalId: 1 });
DataSchema.index({ 'address.city': 1 });
DataSchema.index({ 'address.country': 1 });

