# PostgreSQL Migration Guide

This document outlines the migration from SQLite to PostgreSQL 16 with pgvector support.

## Overview

The application has been successfully migrated from SQLite to PostgreSQL 16 with pgvector for vector similarity search. This provides better performance, scalability, and advanced features like vector embeddings for AI-powered content curation.

## What Changed

### Database Provider
- **Before**: SQLite (`file:./dev.db`)
- **After**: PostgreSQL 16 with pgvector extension

### Schema Changes
- **Enums**: Converted from string literals to proper PostgreSQL enums
  - `UserRole`: VIEWER, EDITOR, ADMIN
  - `CrawlStatus`: PENDING, RUNNING, COMPLETED, FAILED
  - `PostStatus`: DRAFT, REVIEW, PUBLISHED, REJECTED
- **Arrays**: Tags field now uses PostgreSQL array type instead of JSON string
- **Vector Support**: Added `embedding` field with pgvector for similarity search
- **Indexes**: Added proper PostgreSQL indexes including vector similarity index

### Docker Setup
- **Database Service**: PostgreSQL 16 with pgvector
- **Health Checks**: Proper database readiness checks
- **Environment Variables**: Configurable PostgreSQL connection settings

## Quick Start

### Clean Switch (Recommended)

1. **Start the application**:
   ```bash
   ./scripts/local-postgres.sh
   ```

2. **Access the application**:
   - Public: http://localhost:3000/
   - Admin: http://localhost:3000/admin
   - Health: http://localhost:3000/api/health

3. **Login credentials**:
   - Email: admin@example.com
   - Password: admin123

### Data Migration (Optional)

If you have existing SQLite data that needs to be preserved:

1. **Export SQLite data**:
   ```bash
   npm run export:sqlite
   ```

2. **Start PostgreSQL services**:
   ```bash
   docker compose up -d db
   ```

3. **Run migrations**:
   ```bash
   docker compose exec app npx prisma migrate deploy
   ```

4. **Import data**:
   ```bash
   npm run import:pg
   ```

5. **Start the full application**:
   ```bash
   docker compose up -d
   ```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/curated_content_portal?schema=public"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="curated_content_portal"
POSTGRES_PORT="5432"

# Application
APP_PORT="3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

# AI (Optional)
OPENAI_API_KEY="your-openai-key"
```

### Docker Compose

The application now includes:
- **PostgreSQL 16** with pgvector extension
- **Redis** for caching and sessions
- **Application** container with hot reload for development

## Development

### Local Development

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Database shell
docker compose exec db psql -U postgres -d curated_content_portal

# Application shell
docker compose exec app sh

# Run migrations
docker compose exec app npx prisma migrate deploy

# Seed database
docker compose exec app npm run seed
```

### Testing

```bash
# Unit tests
npm test

# E2E tests (requires running application)
npm run test:e2e

# Configuration validation
npm run validate:config
```

## Production Deployment

### Docker Compose Production

```bash
# Use production compose file
docker compose -f docker-compose.prod.yml up -d

# Deploy script
./scripts/deploy.sh
```

### Health Checks

The application includes comprehensive health checks:

```bash
# Application health
curl http://localhost:3000/api/health

# Database connectivity
docker compose exec db pg_isready -U postgres

# Redis connectivity
docker compose exec redis redis-cli ping
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: If port 5432 is busy, set `POSTGRES_PORT=5433` in `.env.local`

2. **Permission Issues**: Ensure Docker has proper permissions and the daemon is running

3. **Migration Failures**: Check database logs with `docker compose logs db`

4. **Vector Extension**: Ensure pgvector is properly installed in the PostgreSQL container

### Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs app
docker compose logs db
docker compose logs redis

# Follow logs
docker compose logs -f app
```

## Performance

### PostgreSQL Optimizations

- **Vector Index**: HNSW index for fast similarity search
- **Regular Indexes**: On status, publishedAt, createdAt, urlHash
- **Connection Pooling**: Built into Prisma
- **Query Optimization**: PostgreSQL query planner

### Monitoring

- **Health Endpoint**: `/api/health` for application status
- **Database Metrics**: Available via PostgreSQL stats
- **Application Metrics**: Built-in Next.js monitoring

## Security

### Database Security

- **Environment Variables**: All secrets in environment variables
- **Connection Security**: PostgreSQL authentication required
- **Network Isolation**: Services in Docker network

### Application Security

- **Authentication**: NextAuth.js with proper session management
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Prisma schema validation
- **SQL Injection**: Protected by Prisma ORM

## Migration Checklist

- [x] PostgreSQL 16 with pgvector setup
- [x] Prisma schema updated for PostgreSQL
- [x] Docker Compose configuration
- [x] Environment variables updated
- [x] Migration scripts created
- [x] Data export/import tools
- [x] Health checks implemented
- [x] Tests updated for PostgreSQL
- [x] CI/CD pipeline updated
- [x] Documentation created

## Support

For issues or questions:

1. Check the logs: `docker compose logs`
2. Verify configuration: `npm run validate:config`
3. Test database connection: `docker compose exec db pg_isready -U postgres`
4. Run health check: `curl http://localhost:3000/api/health`

The migration is complete and the application is ready for production use with PostgreSQL and pgvector!
