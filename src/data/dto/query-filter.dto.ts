import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryFilterDto {
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @IsString()
  priceSegment?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;
}

