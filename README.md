# BUENRO - Backend Data Ingestion & Query API

A scalable NestJS backend solution for ingesting multiple JSON data sources from S3 and providing flexible querying capabilities.

## Quick Start

### Prerequisites

- Node.js 20 (using nvm)
- Docker (for MongoDB)
- npm

### Installation & Running

```bash
# 1. Use Node 20
nvm use 20

# 2. Install dependencies
npm install

# 3. Start MongoDB using Docker
docker compose up -d

# 4. Start the application
npm run start:dev
```

The application will:
- Start on `http://localhost:3000`
- Automatically ingest data from S3 every 5 minutes
- Be ready to query via API

## API Endpoints

### Query Data
```bash
GET /api/data?[filters]
```

**Supported Filters:**
- `source` - Filter by source name (e.g., `source1`, `source2`)
- `city` - Partial text match on city
- `country` - Partial text match on country  
- `name` - Partial text match on name
- `availability` - Filter by availability (`true` or `false`)
- `priceSegment` - Filter by price segment (`low`, `medium`, `high`)
- `minPrice` - Minimum price
- `maxPrice` - Maximum price

**Examples:**
```bash
# Get all data
curl http://localhost:3000/api/data

# Filter by city
curl "http://localhost:3000/api/data?city=Paris"

# Filter by price range
curl "http://localhost:3000/api/data?minPrice=200&maxPrice=400"

# Combined filters
curl "http://localhost:3000/api/data?city=Paris&availability=true&minPrice=300"
```

### Other Endpoints

```bash
# Get data sources
GET /api/data/sources

# Get statistics  
GET /api/data/stats

# Manually trigger ingestion
POST /api/ingest
```

## Architecture

### Key Components

1. **Ingestion Module** (`src/ingestion/`)
   - Fetches JSON data from S3 URLs
   - Handles data normalization
   - Scheduled ingestion every 5 minutes

2. **Data Module** (`src/data/`)
   - MongoDB schema and storage
   - Flexible query API with filtering
   - Unified data model

3. **Configuration** (`src/config/`)
   - Environment-based configuration
   - MongoDB connection

### Tech Stack

- **Framework:** NestJS with TypeScript
- **Database:** MongoDB (via Mongoose)
- **HTTP Client:** Axios
- **Scheduler:** @nestjs/schedule
- **Runtime:** Node.js 20

## Extending the Solution for New Data Sources

Adding new external JSON sources with different data structures is straightforward:

### Step 1: Add the Data Source URL

Edit `src/ingestion/ingestion.service.ts`:

```typescript
private async getDataSources(): Promise<DataSource[]> {
  return [
    // ... existing sources
    {
      name: 'source3',  // unique identifier
      url: 'https://example.com/new-source.json',
      type: 'json',
    },
  ];
}
```

That's it if the schema is compatible with the existing unified model.

### Step 2: Handle Different Schemas (if needed)

If your new source has a different structure, update the normalization logic in `src/data/data.service.ts`:

```typescript
private normalizeData(rawData: any, source: string): Partial<Data> {
  const normalized: Partial<Data> = {
    source,
    rawData,
    originalId: rawData.id.toString(),
  };

  // Handle your new source
  if (source === 'source3') {
    // Map your source's fields to the unified schema
    normalized.name = rawData.title;  // different field name
    normalized.city = rawData.location?.city;
    normalized.pricePerNight = rawData.cost;
    normalized.isAvailable = rawData.available === 'yes';
    // ... map any other fields
  }

  return normalized;
}
```

### What Works Automatically

After adding the source (and mapping if needed):

✅ **Automatic ingestion** - Runs every 5 minutes  
✅ **Storage** - MongoDB handles flexible schema  
✅ **Query API** - All filters work automatically  
✅ **No duplicates** - Upsert prevents duplicates  
✅ **Indexing** - Common fields are indexed for performance  

### Example: Adding a New Source

**Source URL:** `https://api.example.com/properties.json`  
**Schema:**
```json
{
  "id": "abc123",
  "title": "Beach House",
  "location": { "city": "Miami", "country": "USA" },
  "price": 299,
  "available": true
}
```

**Implementation:**

1. Add to `getDataSources()`:
```typescript
{
  name: 'properties',
  url: 'https://api.example.com/properties.json',
  type: 'json',
}
```

2. Add normalization in `normalizeData()`:
```typescript
if (source === 'properties') {
  normalized.name = rawData.title;
  normalized.city = rawData.location?.city;
  normalized.country = rawData.location?.country;
  normalized.pricePerNight = rawData.price;
  normalized.isAvailable = rawData.available;
}
```

**That's it!** The system will:
- Fetch from the URL every 5 minutes
- Store in MongoDB
- Be queryable via `/api/data?city=Miami`
- Support all existing filters

## Project Structure

```
src/
├── main.ts              # Application entry point
├── app.module.ts        # Root module
├── config/              # Configuration service
├── data/
│   ├── data.schema.ts  # MongoDB schema
│   ├── data.service.ts # Query & normalization logic
│   ├── data.controller.ts # API endpoints
│   └── dto/            # Query filter DTOs
└── ingestion/
    ├── ingestion.service.ts  # S3 fetch logic
    ├── ingestion.controller.ts
    ├── ingestion.scheduler.ts # Cron job
    └── ingestion.module.ts
```

## Docker Setup

MongoDB runs in Docker via `docker-compose.yml`:

```bash
# Start MongoDB
docker compose up -d

# Stop MongoDB
docker compose down
```

## Environment Variables

Create a `.env` file (optional):

```env
MONGODB_URI=mongodb://localhost:27017/buenro
PORT=3000
INGESTION_INTERVAL=300000  # 5 minutes in milliseconds
```

## Performance Considerations

- **MongoDB indexes** on key fields for fast queries
- **Upsert strategy** prevents duplicates and handles updates
- **Axios configuration** handles large files (timeout, max content length)
- **Connection pooling** via Mongoose

For very large files (>1GB), consider implementing streaming JSON parsing.

## Testing (not implemented)

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:cov
```

## Development

```bash
# Watch mode
npm run start:dev

# Build
npm run build

# Production
npm run start:prod
```

## License

MIT
