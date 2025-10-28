import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Data, DataDocument } from './data.schema';
import { QueryFilterDto } from './dto/query-filter.dto';

@Injectable()
export class DataService {
  constructor(@InjectModel(Data.name) private dataModel: Model<DataDocument>) {}

  /**
   * Create or update data entry
   */
  async createOrUpdate(originalId: string, source: string, rawData: any): Promise<DataDocument> {
    const normalized = this.normalizeData(rawData, source);
    
    return this.dataModel.findOneAndUpdate(
      { originalId, source },
      { $set: normalized },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  /**
   * Query data with flexible filtering
   */
  async query(filters: QueryFilterDto): Promise<DataDocument[]> {
    const query: any = {};
    const conditions: any[] = [];

    // Source filter
    if (filters.source) {
      query.source = filters.source;
    }

    // City filter - search in both city and address.city
    if (filters.city) {
      conditions.push({
        $or: [
          { city: new RegExp(filters.city, 'i') },
          { 'address.city': new RegExp(filters.city, 'i') },
        ],
      });
    }

    // Country filter
    if (filters.country) {
      conditions.push({
        $or: [
          { country: new RegExp(filters.country, 'i') },
          { 'address.country': new RegExp(filters.country, 'i') },
        ],
      });
    }

    // Name filter
    if (filters.name) {
      conditions.push({ name: new RegExp(filters.name, 'i') });
    }

    // Availability filter - handle both boolean and string fields
    if (filters.availability !== undefined) {
      const isAvailable = filters.availability === 'true';
      conditions.push({
        $or: [
          { isAvailable },
          { availability: filters.availability },
          { availability: isAvailable },
        ],
      });
    }

    // Price segment filter
    if (filters.priceSegment) {
      conditions.push({ priceSegment: filters.priceSegment });
    }

    // Price range filtering - handle both priceForNight and pricePerNight
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceConditions: any[] = [];

      // Build priceForNight condition
      const priceForNightCond: any = { priceForNight: { $exists: true } };
      if (filters.minPrice !== undefined) priceForNightCond.priceForNight.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) priceForNightCond.priceForNight.$lte = filters.maxPrice;
      priceConditions.push(priceForNightCond);

      // Build pricePerNight condition
      const pricePerNightCond: any = { pricePerNight: { $exists: true } };
      if (filters.minPrice !== undefined) pricePerNightCond.pricePerNight.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) pricePerNightCond.pricePerNight.$lte = filters.maxPrice;
      priceConditions.push(pricePerNightCond);

      conditions.push({ $or: priceConditions });
    }

    // Combine all conditions
    if (conditions.length > 0) {
      query.$and = conditions;
    }

    return this.dataModel.find(query).exec();
  }

  /**
   * Normalize data from different sources into unified schema
   */
  private normalizeData(rawData: any, source: string): Partial<Data> {
    const normalized: Partial<Data> = {
      source,
      rawData,
      originalId: rawData.id.toString(),
    };

    // Handle source 1 (hotel data with nested address)
    if (source === 'source1') {
      normalized.name = rawData.name;
      normalized.isAvailable = rawData.isAvailable === true || rawData.isAvailable === 'true';
      normalized.priceForNight = rawData.priceForNight ? parseFloat(rawData.priceForNight) : undefined;
      if (rawData.address) {
        normalized.address = rawData.address;
        normalized.city = rawData.address.city;
        normalized.country = rawData.address.country;
      }
    }

    // Handle source 2 (flat structure)
    if (source === 'source2') {
      normalized.city = rawData.city;
      normalized.pricePerNight = rawData.pricePerNight ? parseFloat(rawData.pricePerNight) : undefined;
      normalized.priceSegment = rawData.priceSegment;
      normalized.availability = rawData.availability?.toString();
    }

    return normalized;
  }

  /**
   * Get all unique sources
   */
  async getSources(): Promise<string[]> {
    const sources = await this.dataModel.distinct('source');
    return sources;
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<any> {
    const totalCount = await this.dataModel.countDocuments();
    const sourceCounts = await this.dataModel.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);
    return { totalCount, sourceCounts };
  }
}

