# Data Integration Needs

This document tracks missing data integrations that need to be implemented to replace placeholder/mock data.

## Authentication & User Management

### TODO: Real User Authentication
- **Current**: Hardcoded password check (`admin123`) in `src/lib/auth.ts`
- **Needed**: Real authentication system with proper password hashing
- **Priority**: High
- **Files**: `src/lib/auth.ts`


## Content Management

### TODO: Real Content Crawling APIs
- **Current**: Mock crawling with hardcoded search engines
- **Needed**: Integration with real RSS feeds and web scraping APIs
- **Priority**: High
- **Files**: `scripts/crawl.ts`

### TODO: OpenAI API Integration
- **Current**: Placeholder OpenAI integration
- **Needed**: Real OpenAI API calls for content curation
- **Priority**: High
- **Files**: `src/lib/ai.ts`

### TODO: Real Content Sources
- **Current**: Hardcoded source domains in seed data
- **Needed**: Dynamic source configuration and management
- **Priority**: Medium
- **Files**: Admin interface for source management

## Database & Storage

### TODO: Production Database
- **Current**: SQLite for development
- **Needed**: Production PostgreSQL with pgvector for vector similarity
- **Priority**: High
- **Files**: Database configuration and migrations

### TODO: File Storage
- **Current**: No image storage system
- **Needed**: Image hosting for crawled content images
- **Priority**: Medium
- **Files**: New storage integration needed

## Admin Interface

### TODO: Admin Panel Pages
- **Current**: Admin dashboard shows 404s for sub-pages
- **Needed**: Complete admin interface for keywords, posts, sources, users, settings
- **Priority**: High
- **Files**: All `/admin/*` routes

### TODO: Content Review System
- **Current**: No content review workflow
- **Needed**: Admin interface for reviewing and publishing curated content
- **Priority**: High
- **Files**: Admin post management pages

## API Endpoints

### TODO: Admin API Routes
- **Current**: Missing admin API endpoints
- **Needed**: CRUD APIs for keywords, posts, sources, users
- **Priority**: High
- **Files**: New API routes in `/api/admin/`

### TODO: Content Ingestion APIs
- **Current**: No API endpoints for content ingestion
- **Needed**: APIs for triggering crawls and curation
- **Priority**: High
- **Files**: New API routes needed

## Configuration

### TODO: Environment Configuration
- **Current**: Example environment files with placeholder values
- **Needed**: Production-ready environment configuration
- **Priority**: Medium
- **Files**: Environment configuration files

## Testing

### TODO: Real Data Tests
- **Current**: Tests use mock data
- **Needed**: Tests with real API integrations
- **Priority**: Medium
- **Files**: Test files

## Deployment

### TODO: Production Deployment
- **Current**: Development-focused Docker setup
- **Needed**: Production deployment configuration
- **Priority**: High
- **Files**: Docker and deployment configuration
