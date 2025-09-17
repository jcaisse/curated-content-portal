# Deployment Standard Operating Procedure (SOP)

**AGENT INSTRUCTION: On any future message containing the word deploy, open this SOP and execute npm run deploy:<env> using the env the user specifies (default deploy:local). Do not deviate without explicit approval.**

## Overview
This SOP ensures repeatable, reliable deployments of the Curated Content Portal using Docker Compose with PostgreSQL + pgvector. All steps must be executed in order without deviation.

## Prerequisites
- Docker and Docker Compose installed
- Environment file exists (default: `./.secrets/.env.local`)
- Git repository with clean working directory
- All required secrets configured in environment file

## Deployment Steps

### 1. Clean Start
```bash
docker compose down --remove-orphans || true
```

### 2. Preflight Checks (Fail Fast)
```bash
npm run ci:preflight
```
**Expected**: All guards pass (no-musl, no-npx-prisma, tailwind, migrations, ts-check, lint-strict)

### 3. Build Fresh Image
```bash
docker compose --env-file ./.secrets/.env.local build --no-cache --pull app
```
**Expected**: Image builds successfully with all dependencies

### 4. Prove Image Integrity
```bash
npm run ci:prove-image
```
**Expected**: CSS files present, migrations match repo, Prisma engines working

### 5. Deploy Stack
```bash
docker compose --env-file ./.secrets/.env.local up -d --force-recreate --remove-orphans
```
**Expected**: All services start in correct order (db → migrate → app)

### 6. Verify Deployment
```bash
# Check migrate service completed successfully
docker compose logs migrate --no-log-prefix

# Check app service is ready
docker compose logs app --no-log-prefix | egrep -i "ready|listening|started"

# Verify application responds
curl -I http://localhost:3000
```

## Expected Log Output

### Migrate Service Success:
```
Waiting for database to be ready...
Running Prisma migrations...
All migrations have been successfully applied.
Running database seed...
Seed: ensured admin admin@example.com
Running auth fingerprint check...
Auth fingerprint: OK.
Running database smoke test...
DB smoke: OK [ { ok: 1 } ]
Migrations, seed, fingerprint check, and smoke test completed successfully
```

### App Service Success:
```
✓ Ready in 151ms
```

### HTTP Response:
```
HTTP/1.1 200 OK
X-Powered-By: Next.js
Content-Type: text/html; charset=utf-8
```

## Admin Credentials
- **Email**: `admin@example.com`
- **Password**: From `ADMIN_PASSWORD` in environment file

## Rollback Procedure
If deployment fails:
1. Check logs: `docker compose logs`
2. Fix issues in code/environment
3. Re-run deployment from step 1

## Environment-Specific Deployments
- **Local**: `npm run deploy:local`
- **Staging**: `npm run deploy:staging`
- **Production**: `npm run deploy:prod`

## Critical Requirements
- Never use Alpine/musl base images
- Never run `npx prisma` at runtime
- Always use Debian slim base
- Always generate Prisma client at build time
- Always run migrations before seeding
- Always verify CSS and migrations in image
