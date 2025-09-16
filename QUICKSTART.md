# 🚀 Quick Start Guide

## Prerequisites

- Node.js 20+ installed
- PostgreSQL (or use SQLite for development)
- OpenAI API key

## 1. Environment Setup

```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your values:
# - NEXTAUTH_SECRET (already generated for you)
# - OPENAI_API_KEY (get from https://platform.openai.com/api-keys)
# - ADMIN_INGEST_KEY (already generated for you)
```

## 2. Database Setup

### Option A: PostgreSQL (Recommended)
```bash
# Install PostgreSQL locally or use Docker
docker run -d -p 5432:5432 \
  -e POSTGRES_DB=curated_content \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  postgres:16

# Update .env.local:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/curated_content"
```

### Option B: SQLite (Development Only)
```bash
# Update .env.local:
# DATABASE_URL="file:./dev.db"

# Update prisma/schema.prisma:
# provider = "sqlite"
```

## 3. Development Setup

```bash
# Run the setup script
./scripts/setup-dev.sh

# Or manually:
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
```

## 4. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 5. Admin Access

- **URL**: http://localhost:3000/admin
- **Email**: admin@example.com
- **Password**: admin123

## 6. Test Content Curation

```bash
# Crawl content for a keyword
npm run crawl -- --keyword="artificial intelligence" --limit=5

# Run AI curation on crawled content
npm run curate
```

## 7. Available Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:migrate      # Run migrations
npm run db:push         # Push schema changes
npm run db:seed         # Seed sample data
npm run db:studio       # Open Prisma Studio

# Testing
npm run test            # Run unit tests
npm run test:e2e        # Run e2e tests

# Content Management
npm run crawl -- --keyword="keyword" --limit=10
npm run curate

# Docker (if available)
make compose-dev        # Start with Docker
make compose-prod       # Production with Docker
```

## 8. Production Deployment

```bash
# Deploy to server
./scripts/deploy.sh your-server.com deploy-user my-app

# Or use Docker Compose
docker compose --profile prod up -d
```

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env.local
- Try SQLite for development: `DATABASE_URL="file:./dev.db"`

### OpenAI API Issues
- Verify your API key in .env.local
- Check your OpenAI account has credits
- API key format: `sk-...`

### Port Already in Use
- Change PORT in .env.local
- Kill existing processes: `lsof -ti:3000 | xargs kill`

## Next Steps

1. **Add Keywords**: Go to Admin → Keywords to add search terms
2. **Crawl Content**: Use the crawl script or admin interface
3. **Curate Content**: Review and publish curated posts
4. **Customize**: Modify the UI, add new features, or integrate more sources

## Support

- Check README.md for detailed documentation
- Run `./scripts/verify-setup.sh` to verify your setup
- Issues? Check the logs or run tests
