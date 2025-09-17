# Curated Content Portal

A Pinterest-style curated content site with AI-powered content curation, built for maximum portability across macOS and Linux environments.

## Features

- **AI-Powered Curation**: Uses OpenAI to analyze and curate content
- **Multi-Source Ingestion**: RSS feeds and web crawling with Crawlee
- **Vector Similarity**: pgvector for content deduplication and related posts
- **Role-Based Access**: Admin/Editor/Viewer roles with NextAuth
- **SEO Optimized**: RSS feeds, sitemaps, and structured data
- **Fully Containerized**: Runs anywhere with Docker
- **Multi-Architecture**: Supports both Intel and Apple Silicon
- **Architecture Lock**: Enforced PostgreSQL + pgvector + Docker invariants

## Architecture Lock

This project enforces strict architectural invariants to prevent drift from the approved design:

### Database Password Management

**Important**: If you change `POSTGRES_PASSWORD` after the DB volume exists, it won't update the running database. You have two options:

1. **Change password inside the running DB** (preferred):
   ```bash
   docker compose exec db sh -lc "psql -U postgres -c \"ALTER USER postgres WITH PASSWORD '\$POSTGRES_PASSWORD';\""
   ```

2. **Recreate the DB volume** (dev-only, data loss):
   ```bash
   docker compose down --remove-orphans
   docker volume rm curated-content-portal_db-data
   docker compose --env-file ./.secrets/.env.local up -d --force-recreate
   ```

### Locked Architecture
- **Database**: PostgreSQL 16 with pgvector extension (no SQLite)
- **Runtime**: Dockerized with Docker Compose orchestration
- **Application**: Next.js + Prisma + NextAuth (unchanged)

### Enforcement Guards
- **Pre-commit hooks**: Block SQLite changes before they're committed
- **CI/CD pipeline**: Validates architecture on every push/PR
- **Runtime protection**: App refuses to start with invalid configuration
- **Developer experience**: Clear error messages and approval process

### Making Changes
Any changes to architectural invariants require:
1. Create `ARCH_CHANGE_REQUEST.md` with approval flag
2. Pull request review with architectural approval
3. Automated guards will block unauthorized changes

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete details.

## Security & Secrets Management

This project enforces strong security practices with environment-based secret management and validation.

### Auth Secret Fingerprinting

The application uses a database-backed auth secret fingerprint system to prevent JWT session errors:

**How it works:**
- Auth secrets are fingerprinted using SHA-256 and stored in the `AppConfig` table
- Fingerprint validation happens during the migrate step (before app starts)
- If secrets change, startup fails with clear instructions unless rotation is allowed

**Secret Rotation:**
To rotate auth secrets safely:
1. Set `ALLOW_AUTH_SECRET_ROTATION=true` in your environment
2. Update your auth secrets (`AUTH_SECRET`, `NEXTAUTH_SECRET`)
3. Restart the application - it will update the fingerprint
4. Inform users they may need to re-login
5. Remove the rotation flag for subsequent starts

**Storage:**
- Fingerprint stored in `AppConfig` table with key format: `auth_fpr:${NODE_ENV}`
- No filesystem writes - completely database-backed
- Environment-scoped (development/staging/production have separate fingerprints)

**Quick Reference:**
- The app stores a SHA-256 fingerprint of AUTH_SECRET/NEXTAUTH_SECRET in AppConfig
- Startup will fail if it changes unexpectedly
- To rotate intentionally: set ALLOW_AUTH_SECRET_ROTATION=true for one run, then remove it

### Secret Requirements

**Development Environment:**
- More lenient validation with warnings
- Can auto-generate temporary secrets for non-critical items
- Minimum 8-character passwords, 16-character secrets

**Staging/Production Environment:**
- Strict validation - fails fast on weak/missing secrets
- Database passwords: 20+ chars with mixed case, numbers, symbols
- Secrets (NEXTAUTH_SECRET, ADMIN_INGEST_KEY): 32+ chars random
- No hardcoded defaults or weak passwords allowed
- Admin password must be set explicitly (no auto-generation)

### Environment Files

The project uses separate environment files for different deployment contexts:

- `.env.development` - Development template (copy to `.secrets/.env.local`)
- `.env.staging.example` - Staging template (copy to `.env.staging`)
- `.env.production.example` - Production template (copy to `.env.production`)

**Never commit actual environment files with real secrets!**

### Secret Generation

Generate strong secrets using the built-in utilities:

```bash
# Generate all secrets
npm run secrets:gen

# Generate specific secret types
node scripts/gensecret.mjs nextauth
node scripts/gensecret.mjs postgres
node scripts/gensecret.mjs admin
```

### Secret Rotation

Rotate development secrets safely:

```bash
# Rotate development secrets
npm run secrets:rotate:dev

# Manual rotation for staging/production
./scripts/rotate-secrets.sh staging
./scripts/rotate-secrets.sh prod
```

### Security Validation

The application includes multiple security validation layers:

1. **Boot-time Guards**: Validate secrets on application startup
2. **Pre-commit Hooks**: Block hardcoded secrets from being committed
3. **CI/CD Pipeline**: Scan for security violations on every build
4. **Runtime Protection**: Fail fast if secrets are missing or weak

Run security checks manually:

```bash
# Check for hardcoded secrets
npm run check:secrets

# Check for TODOs/FIXMEs that might block production
npm run check:todos

# Run all security checks
npm run check:all
```

### Security Checklist

Before deploying to production:

- [ ] All secrets are generated using strong, random values
- [ ] No hardcoded passwords or API keys in code
- [ ] Environment files are properly configured and secured
- [ ] Database uses strong authentication
- [ ] Admin account has a secure password
- [ ] All security checks pass (`npm run check:secrets`)
- [ ] No blocking TODOs remain (`npm run check:todos`)
- [ ] Architecture lock validation passes (`npm run check:arch`)

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- OpenAI API key (optional)

### Local Development with Docker (Recommended)

**Complete Setup & Runbook:**

1. **Clone and setup**:
   ```bash
   git clone <repository>
   cd curated-content-portal
   npm ci
   ```

2. **Environment setup**:
   ```bash
   # Bootstrap environment and secrets
   npm run env:bootstrap
   npm run env:check
   ```

3. **Prove-the-build (verify image matches commit)**:
   ```bash
   # Build image with current commit SHA
   npm run build:image
   
   # Verify image labels match current commit
   npm run verify:image
   ```

4. **Start services with proper ordering**:
   ```bash
   # Build and start all services
   docker compose --env-file ./.secrets/.env.local build --no-cache --pull
   docker compose --env-file ./.secrets/.env.local up -d --force-recreate
   ```

5. **Verify service health and ordering**:
   ```bash
   # Check DB health and pgvector extension
   docker compose exec db pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-app}
   docker compose exec db psql -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-app} -c "select 1 from pg_extension where extname='vector';"
   
   # Verify migrations completed
   docker compose logs migrate
   
   # Verify app is running
   docker compose logs app | grep -i "ready\|listening\|started"
   ```

6. **Verify we're testing the new image**:
   ```bash
   # Check image labels include commit SHA
   docker inspect $(docker compose images app --quiet) --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' && git rev-parse HEAD
   ```

7. **Access the application**:
   - Public site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin
   - Default admin: admin@example.com / (check bootstrap output for password)

**Troubleshooting:**

- **Compose warnings**: Run `docker compose config` to validate configuration
- **Environment issues**: Run `npm run env:check` to validate secrets
- **Architecture drift**: Run `npm run ci:preflight` to check for violations
- **Image mismatch**: Run `npm run verify:image` to ensure image matches commit
- **Service ordering**: Check `docker compose logs migrate` and `docker compose logs app`
- **Database issues**: Verify pgvector with `docker compose exec db psql -U postgres -d app -c "select extname from pg_extension;"`
- **Auth issues**: Run `npm run auth:smoke` to test credentials before E2E tests
- **JWT session errors**: See "Secret Rotation" section below

**One-liner verification**:
```bash
docker inspect $(docker compose images app --quiet) --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' && git rev-parse HEAD
```

## Secret Rotation

If you must rotate `AUTH_SECRET`/`NEXTAUTH_SECRET`, follow these steps:

1. **Set rotation flag for one run**:
   ```bash
   ALLOW_AUTH_SECRET_ROTATION=true docker compose --env-file ./.secrets/.env.local up -d
   ```

2. **Inform users**: They may need to log in again due to JWT session invalidation.

3. **Remove rotation flag**: Don't leave `ALLOW_AUTH_SECRET_ROTATION=true` permanently.

4. **For E2E tests**: Tests always start with a fresh context; they will not reuse old cookies.

**Auth Fingerprint Guard**: The system detects auth secret changes and fails fast with a clear message unless rotation is explicitly allowed. This prevents JWT session errors and ensures users know when to re-authenticate.

### Production Deployment (Linux)

1. **Prepare your server**:
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy using the script**:
   ```bash
   # Create production environment file
   cp env.example .env.prod
   # Edit .env.prod with production values
   
   # Deploy
   ./scripts/deploy.sh your-server.com deploy-user my-app
   ```

3. **Or deploy manually**:
   ```bash
   # Copy files to server
   scp docker-compose.yml .env.prod your-server.com:/opt/my-app/
   
   # On server
   cd /opt/my-app
   docker compose --profile prod up -d
   ```

## Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL 16 with pgvector extension
- **Authentication**: NextAuth.js with RBAC
- **AI**: OpenAI GPT-4 via Vercel AI SDK
- **Crawling**: Crawlee with Playwright and Cheerio
- **Testing**: Vitest (unit), Playwright (e2e)
- **Deployment**: Docker multi-arch images, Docker Compose

### Data Model

```
User (Admin/Editor/Viewer)
├── Keywords (search terms)
├── CrawlRuns (ingestion jobs)
└── Posts (curated content)
    ├── Related Posts (vector similarity)
    └── Tags (AI-generated)
```

## Development

### Available Commands

```bash
# Development
make dev              # Start dev server
make build            # Build for production
make start            # Start production server

# Database
make db-migrate       # Run migrations
make db-push          # Push schema changes
make db-seed          # Seed with sample data
make db-studio        # Open Prisma Studio

# Testing
make test             # Run unit tests
make e2e              # Run end-to-end tests
make e2e-ui           # Run e2e tests with UI

# Docker
make compose-dev      # Start dev environment
make compose-prod     # Start prod environment
make compose-test     # Run tests in Docker

# Content Management
make crawl KEYWORD="ai" LIMIT=10    # Crawl content
make curate                        # Run AI curation

# Deployment
make deploy HOST=example.com USER=deploy APP=my-app
```

### Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── admin/          # Admin interface
│   │   └── posts/          # Public post pages
│   ├── components/         # React components
│   ├── lib/               # Utilities and configurations
│   └── test/              # Test setup
├── prisma/                # Database schema and migrations
├── scripts/               # Crawling and deployment scripts
├── tests/                 # E2E tests
├── docker-compose.yml     # Multi-profile Docker setup
├── Dockerfile            # Multi-stage production build
└── Dockerfile.test       # Test environment with browsers
```

## Content Ingestion

### RSS Feeds (Primary)

The system prioritizes RSS feeds for content discovery:

```bash
# Add RSS feeds for keywords
curl -X POST http://localhost:3000/api/admin/keywords \
  -H "Authorization: Bearer $ADMIN_INGEST_KEY" \
  -d '{"name": "artificial intelligence", "rssFeeds": ["https://example.com/ai-feed.xml"]}'
```

### Web Crawling (Fallback)

Uses Crawlee with Playwright for dynamic content:

```bash
# Crawl specific keyword
npm run crawl -- --keyword="machine learning" --limit=50
```

### AI Curation

Content goes through AI analysis for:
- Duplicate detection (vector similarity > 0.88)
- Quality scoring
- Tag generation
- Summary creation
- Related content linking

## Admin Interface

### Keyword Management

- Add/edit search keywords
- Configure RSS feeds
- Set crawling parameters
- Monitor ingestion status

### Review Queue

- Review crawled content
- Edit AI-generated summaries
- Approve/reject posts
- Bulk operations

### Analytics

- Content performance metrics
- Keyword effectiveness
- Source quality analysis

## API Reference

### Public Endpoints

- `GET /` - Homepage with curated content grid
- `GET /posts/:id` - Individual post page
- `GET /rss.xml` - RSS feed
- `GET /sitemap.xml` - XML sitemap
- `GET /robots.txt` - Robots.txt
- `GET /api/health` - Health check

### Admin Endpoints

- `POST /api/admin/keywords` - Create keyword
- `GET /api/admin/posts` - List posts
- `PUT /api/admin/posts/:id` - Update post
- `POST /api/admin/crawl` - Start crawling
- `POST /api/admin/curate` - Run AI curation

## Testing

### Unit Tests

```bash
npm run test
```

Tests cover:
- Utility functions
- Data validation
- API route handlers
- Database operations

### E2E Tests

```bash
npm run test:e2e
```

Tests cover:
- Public page rendering
- RSS/sitemap generation
- Admin workflows
- Authentication flows

### Running Tests in CI

```bash
# Full test suite in Docker
make compose-test
```

## Deployment

### Docker Multi-Arch Builds

The project builds multi-architecture images supporting:
- `linux/amd64` (Intel/AMD servers)
- `linux/arm64` (Apple Silicon, ARM servers)

### Environment Profiles

#### Development (`--profile dev`)
- Hot reload with bind mounts
- Development database
- Debug logging enabled

#### Production (`--profile prod`)
- Optimized Next.js build
- Persistent database volumes
- Optional Caddy reverse proxy

#### Testing (`--profile test`)
- Test database
- Playwright browsers included
- CI-optimized configuration

### Reverse Proxy Options

#### Caddy (Recommended)
- Automatic HTTPS
- HTTP/2 support
- Built-in security headers

#### Nginx (Alternative)
- Manual configuration
- More control over caching
- Traditional setup

### Backup and Restore

```bash
# Backup database
docker exec postgres pg_dump -U postgres curated_content > backup.sql

# Restore database
docker exec -i postgres psql -U postgres curated_content < backup.sql
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:port/db"

# Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"

# AI
OPENAI_API_KEY="sk-..."

# Admin
ADMIN_INGEST_KEY="your-admin-key"

# Deployment
DOMAIN="yourdomain.com"
EMAIL="admin@yourdomain.com"
```

### Database Migrations

Migrations run automatically on container start:

```bash
# Manual migration
make db-migrate

# Reset database
make db-push
make db-seed
```

## Troubleshooting

### Common Issues

1. **Database connection fails**
   ```bash
   # Check if PostgreSQL is running
   docker compose ps
   
   # View logs
   docker compose logs db
   ```

2. **AI curation not working**
   ```bash
   # Check OpenAI API key
   echo $OPENAI_API_KEY
   
   # Test API connection
   curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
   ```

3. **Crawling fails**
   ```bash
   # Check robots.txt compliance
   curl https://example.com/robots.txt
   
   # Review crawling logs
   docker compose logs app-prod
   ```

### Performance Optimization

1. **Database indexing**
   - Vector similarity indexes are pre-configured
   - Add custom indexes for your query patterns

2. **Caching**
   - Next.js automatic caching for static content
   - Database query caching via Prisma
   - CDN recommended for production

3. **Scaling**
   - Horizontal scaling with multiple app instances
   - Database read replicas for heavy traffic
   - Redis for session storage in multi-instance setups

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Setup

```bash
# Install dependencies
npm install

# Setup database
make db-push
make db-seed

# Start development
make dev
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues for bugs and feature requests
- Discussions for general questions
- Documentation in `/docs` folder

---

**Built with ❤️ for content curation enthusiasts**

## 🚀 Local Run (macOS, Docker)

### One-time Setup

```bash
# Bootstrap environment (creates .secrets/.env.local with strong secrets)
npm run env:bootstrap

# Validate configuration
npm run compose:validate
npm run env:check
```

### Rebuild & Start

```bash
# Rebuild containers with latest code
npm run compose:rebuild

# Start all services
npm run compose:up

# Run database migrations
npm run db:migrate

# Seed database with initial data
npm run db:seed
```

### Verify Installation

```bash
# Check container status
docker compose ps

# View application logs
docker compose logs app --tail 20

# Open application
open http://localhost:3000/
```

### Access Points

- **Public Site**: http://localhost:3000/
- **Admin Dashboard**: http://localhost:3000/admin
- **Health Check**: http://localhost:3000/api/health
- **Database**: localhost:5432 (PostgreSQL with pgvector)

### Admin Login

After seeding, login with:
- **Email**: admin@example.com
- **Password**: [generated during bootstrap - check console output]

### Troubleshooting

#### Environment Issues
```bash
# Check environment validation
npm run env:check

# Re-bootstrap if needed
npm run env:bootstrap
```

#### Container Issues
```bash
# View logs
docker compose logs app --tail 50
docker compose logs db --tail 50

# Restart services
docker compose restart app
docker compose restart db

# Full rebuild
npm run compose:down
npm run compose:rebuild
npm run compose:up
```

#### Database Issues
```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Check database connection
docker compose exec app npx prisma db pull
```

### Security Notes

- **Never commit** `.secrets/.env.local` - it contains real secrets
- **Strong passwords** are auto-generated (32+ characters with symbols)
- **Secrets are rotated** on each bootstrap
- **Environment validation** ensures production-grade security
- **Compose validation** prevents secret expansion vulnerabilities

## 🏭 Staging/Production

For staging/production environments:

1. **Create environment-specific secrets**:
   ```bash
   cp .secrets/.env.local.example .secrets/.env.staging
   cp .secrets/.env.local.example .secrets/.env.production
   ```

2. **Use appropriate env file**:
   ```bash
   docker compose --env-file ./.secrets/.env.staging up -d
   docker compose --env-file ./.secrets/.env.production up -d
   ```

3. **Never commit real secrets** - use CI/CD secrets management
4. **Validate before deploy**:
   ```bash
   NODE_ENV=production npm run env:check
   npm run compose:validate
   ```


## 🚀 Permanent PostgreSQL Setup (No Drift)

### One-time Setup

```bash
# Bootstrap environment with strong secrets
npm run env:bootstrap

# Validate configuration
npm run env:check
npm run compose:validate
```

### Build and Start (Proper Ordering)

```bash
# Build application image
npm run compose:rebuild

# Start services in correct order: DB → Migrate → App
npm run compose:up

# Verify database is healthy and pgvector is enabled
docker compose exec db psql -U postgres -d app -c "select extname from pg_extension where extname='vector';"

# Check app image labels include current commit
npm run compose:labels
```

### Verification Commands

```bash
# Check database health
docker compose exec db pg_isready -U postgres -d app

# Verify pgvector extension
docker compose exec db psql -U postgres -d app -c "select 1 from pg_extension where extname='vector';"

# Check migration logs
docker compose logs migrate

# Check app startup logs
docker compose logs app | grep -i "ready\|listening\|started"

# Verify app health
curl -s http://localhost:3000/api/health
```

### Service Startup Order

1. **Database**: PostgreSQL with pgvector extension (healthcheck required)
2. **Migrate**: Runs Prisma migrations (depends on DB health)
3. **App**: Application server (depends on migrate completion)
4. **Redis**: Cache service (independent)

### Troubleshooting

#### Database Issues
```bash
# Check database initialization
docker compose logs db

# Verify environment variables
docker compose exec db env | grep POSTGRES

# Recreate database with fresh volume
docker compose down -v
npm run compose:up
```

#### Migration Issues
```bash
# Check migration logs
docker compose logs migrate

# Run migrations manually
docker compose exec app node node_modules/.bin/prisma migrate deploy
```

### Security Notes

- **Single source of truth**: All secrets from `.secrets/.env.local`
- **No compose expansions**: Secrets loaded via `env_file:`
- **Proper initialization**: pgvector enabled via init SQL
- **Health-gated startup**: App waits for DB + migrations
- **Drift prevention**: Validation scripts prevent configuration drift

