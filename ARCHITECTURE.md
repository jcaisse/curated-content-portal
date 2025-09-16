# Architecture Lock

This document defines the **non-negotiable architectural invariants** for this project. These invariants are enforced through automated guards and cannot be changed without explicit approval.

## Locked Architecture Invariants

### Database: PostgreSQL 16 with pgvector
- **Prisma datasource must be `provider = "postgresql"`**
- **No SQLite, better-sqlite3, sqlite3, or file-based DSNs anywhere**
- **pgvector extension must be enabled for vector embeddings**

### Runtime & Deployment: Dockerized, Compose-orchestrated
- **Multi-arch Docker images**
- **Docker Compose orchestration**
- **PostgreSQL service in docker-compose.yml**

### Application Stack
- **Next.js + Prisma + NextAuth** (unchanged)
- **Local & Production: Both run against PostgreSQL, not SQLite**

## Enforcement Guards

The following automated guards prevent architectural drift:

### Repository Level
- `scripts/validate-architecture.mjs` - Validates Prisma schema and dependencies
- `scripts/validate-pgvector.mjs` - Verifies pgvector extension is enabled
- `scripts/assert-no-sqlite-gitdiff.mjs` - Blocks SQLite changes in git diffs

### Development Workflow
- **Pre-commit hook**: Runs architecture validation
- **Pre-push hook**: Runs architecture and pgvector validation
- **NPM scripts**: `npm run check:arch` and `npm run check:pgvector`

### CI/CD Pipeline
- **GitHub Actions**: Architecture lock checks before build/tests
- **Pipeline fails** on any architectural violations

### Runtime Self-Defense
- **App boot guard**: Validates DATABASE_URL and pgvector extension
- **Health checks**: Fail if architectural requirements not met

## Change Control Protocol

**Any changes to these architectural invariants require:**

1. **Create `ARCH_CHANGE_REQUEST.md`** with:
   - Motivation and impact analysis
   - Migration plan
   - Rollback plan
   - Owner and date
   - **Top-line flag**: `ARCH_CHANGE_APPROVED: true` (must be exactly this)

2. **Pull Request Review** with architectural approval

3. **Automated guards will block** changes without the approval file and flag

## Violation Messages

When architectural violations are detected, the system will display:

```
Architecture lock: attempted change to core invariants detected. 
Provide ARCH_CHANGE_REQUEST.md with ARCH_CHANGE_APPROVED: true to proceed.
```

## Developer Education

### Quick Reference
- **Database**: Always PostgreSQL 16 + pgvector
- **Runtime**: Always Docker + Docker Compose
- **Local Development**: Use `docker compose up` (not `npm run dev` alone)
- **Changes**: Create approval file for any architectural modifications

### Getting Started
1. Ensure Docker is running
2. Run `docker compose up -d`
3. Run `docker compose exec app npx prisma migrate deploy`
4. Run `docker compose exec app npx prisma db seed`

### Troubleshooting
- **App won't start**: Check DATABASE_URL points to PostgreSQL service
- **pgvector errors**: Ensure PostgreSQL service has pgvector extension enabled
- **Architecture violations**: Check for SQLite references or missing approval files

## Enforcement Status

✅ **Active**: All guards are enabled and will block unauthorized changes
✅ **CI Integration**: GitHub Actions validates architecture on every push
✅ **Runtime Protection**: App refuses to start with invalid configuration
✅ **Developer Experience**: Clear error messages and approval process
