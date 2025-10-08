# DEPLOYMENT MASTER PLAN - Clean Portal

## Executive Summary
**Problem**: Multiple failed deployments due to incomplete environment configuration and mismatched docker-compose files.  
**Root Cause**: EC2 instance was never properly initialized, configuration drift between local and production.  
**Solution**: Build locally, push to ECR, deploy to properly configured EC2 with complete environment.

---

## PART 1: COMPLETE ENVIRONMENT VARIABLES MASTER LIST

### Required Variables (from `config-schema.ts` + `env.ts`)

#### 1. DATABASE CONFIGURATION
```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/curated_content_portal?schema=public"

# Individual PostgreSQL settings
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="<STRONG_PASSWORD_MIN_20_CHARS>"  # ⚠️ CRITICAL: 20+ chars, mixed case, numbers, symbols
POSTGRES_DB="curated_content_portal"
POSTGRES_PORT="5432"
```

#### 2. NEXTAUTH CONFIGURATION
```bash
NEXTAUTH_URL="https://your-domain.com"  # ⚠️ MUST match public URL
NEXTAUTH_SECRET="<32_CHAR_BASE64_SECRET>"  # ⚠️ CRITICAL: Generate with: openssl rand -base64 32
```

#### 3. ADMIN USER CONFIGURATION
```bash
ADMIN_EMAIL="your-admin@email.com"  # Used for initial admin user
ADMIN_PASSWORD="<STRONG_PASSWORD_MIN_20_CHARS>"  # ⚠️ CRITICAL: 20+ chars for prod
# OR for first-time setup:
ADMIN_INITIAL_PASSWORD="<STRONG_PASSWORD_MIN_20_CHARS>"  # Auto-removed after first use
```

#### 4. SECURITY CONFIGURATION
```bash
ADMIN_INGEST_KEY="<32_CHAR_RANDOM_STRING>"  # ⚠️ CRITICAL: For API authentication
BCRYPT_ROUNDS="12"  # Password hashing rounds (default: 12)
SESSION_MAX_AGE="86400"  # Session duration in seconds (default: 24 hours)
RATE_LIMIT_REQUESTS_PER_MINUTE="60"
RATE_LIMIT_BURST="10"
```

#### 5. AI CONFIGURATION (OpenAI)
```bash
OPENAI_API_KEY="sk-..."  # ⚠️ REQUIRED for AI features
OPENAI_MODEL="gpt-4o-mini"  # Default model
AI_DISABLED="false"  # Set to "true" to disable AI features
```

#### 6. APP CONFIGURATION
```bash
NODE_ENV="production"  # ⚠️ CRITICAL: Must be "production" for prod
APP_PORT="3000"  # Internal container port
PORT="3000"  # Alternative port variable
DOMAIN="your-domain.com"  # ⚠️ REQUIRED: Your public domain
EMAIL="noreply@your-domain.com"  # ⚠️ REQUIRED: System email address
LOG_LEVEL="info"  # Options: error, warn, info, debug
```

#### 7. CONTENT CONFIGURATION
```bash
RSS_FEED_URLS=""  # Optional: Comma-separated RSS feed URLs
WEB_CRAWL_ENABLED="true"
CRAWL_INTERVAL_HOURS="24"
MAX_CRAWL_ITEMS_PER_RUN="100"
CONTENT_REVIEW_THRESHOLD="0.7"
AUTO_PUBLISH_ENABLED="false"
FILE_STORAGE_STRATEGY="url_only"
```

#### 8. ANALYTICS (Optional)
```bash
ANALYTICS_ENABLED="false"
GOOGLE_ANALYTICS_ID=""  # Optional
```

#### 9. REDIS (Optional - for caching)
```bash
REDIS_URL="redis://redis:6379"
```

#### 10. CRAWLEE STORAGE
```bash
CRAWLEE_STORAGE_DIR="/tmp/crawlee-storage"  # Set in docker-compose
```

---

## PART 2: AWS INFRASTRUCTURE REQUIREMENTS

### AWS Resources Needed
1. **ECR Repository**: `clean-portal` in `us-east-1`
2. **EC2 Instance**: Running Amazon Linux 2023
   - Public IP: `44.198.212.206`
   - Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (app)
3. **IAM Role** (for GitHub Actions):
   - ECR push permissions
   - Assumed via OIDC

### GitHub Secrets Required
```
AWS_ACCOUNT_ID=284077920952
AWS_REGION=us-east-1
AWS_ROLE_TO_ASSUME=arn:aws:iam::284077920952:role/GitHubActionsRole
EC2_HOST=44.198.212.206
EC2_USER=ec2-user
EC2_SSH_KEY=<PRIVATE_KEY_WITHOUT_PASSPHRASE>
EC2_WORKDIR=/home/ec2-user/clean-portal
```

---

## PART 3: DEPLOYMENT STRATEGY

### Option A: Local Build + ECR Push + EC2 Pull (RECOMMENDED)

**Why This Works:**
- Local builds are proven to work (`ops/deploy.sh`)
- No remote build issues or resource constraints
- Clear separation: build locally, deploy remotely
- Matches GitHub Actions workflow

**Steps:**

#### 1. Generate Strong Secrets (Run Locally)
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ADMIN_INGEST_KEY
openssl rand -base64 32 | tr -d '=' | head -c 32

# Generate POSTGRES_PASSWORD
openssl rand -base64 32 | tr -d '='
```

#### 2. Create Production Environment File
Create `.secrets/.env.prod` locally with ALL variables from PART 1.

**Template:**
```bash
# Database
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@db:5432/curated_content_portal?schema=public"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="YOUR_POSTGRES_PASSWORD"
POSTGRES_DB="curated_content_portal"
POSTGRES_PORT="5432"

# NextAuth
NEXTAUTH_URL="http://44.198.212.206:3000"  # Or your domain
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"

# Admin
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="YOUR_ADMIN_PASSWORD"

# Security
ADMIN_INGEST_KEY="YOUR_ADMIN_INGEST_KEY"
BCRYPT_ROUNDS="12"
SESSION_MAX_AGE="86400"

# AI
OPENAI_API_KEY="YOUR_OPENAI_KEY"
OPENAI_MODEL="gpt-4o-mini"
AI_DISABLED="false"

# App
NODE_ENV="production"
APP_PORT="3000"
PORT="3000"
DOMAIN="44.198.212.206"  # Or your domain
EMAIL="admin@example.com"
LOG_LEVEL="info"

# Content
WEB_CRAWL_ENABLED="true"
CRAWL_INTERVAL_HOURS="24"
MAX_CRAWL_ITEMS_PER_RUN="100"
CONTENT_REVIEW_THRESHOLD="0.7"
AUTO_PUBLISH_ENABLED="false"
FILE_STORAGE_STRATEGY="url_only"

# Analytics
ANALYTICS_ENABLED="false"

# Redis
REDIS_URL="redis://redis:6379"
```

#### 3. Build Docker Image Locally
```bash
# From project root
docker compose --env-file .secrets/.env.prod build --no-cache app

# Tag for ECR
docker tag cleanportal-app:latest 284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:latest
docker tag cleanportal-app:latest 284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:$(git rev-parse --short HEAD)
```

#### 4. Push to ECR
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 284077920952.dkr.ecr.us-east-1.amazonaws.com

# Push images
docker push 284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:latest
docker push 284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:$(git rev-parse --short HEAD)
```

#### 5. Setup EC2 Instance (One-Time)
```bash
# SSH to EC2
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206

# Install Docker (if not already)
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose (standalone)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 284077920952.dkr.ecr.us-east-1.amazonaws.com

# Create app directory
mkdir -p ~/clean-portal
cd ~/clean-portal
```

#### 6. Copy Production Files to EC2
Create a deployment package with:
- `docker-compose.prod.yml` (proper production compose file)
- `.env.prod` (environment variables)
- `db/init/` (PostgreSQL init scripts)

**Create `docker-compose.prod.yml`:**
```yaml
version: '3.8'

services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 3s
      retries: 20
      start_period: 10s
    restart: unless-stopped

  migrate:
    image: 284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:latest
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - ADMIN_INGEST_KEY=${ADMIN_INGEST_KEY}
      - DOMAIN=${DOMAIN}
      - EMAIL=${EMAIL}
      - NODE_ENV=${NODE_ENV}
    depends_on:
      db:
        condition: service_healthy
    command: >
      /bin/sh -c "
        echo 'Running Prisma migrations...' &&
        npx prisma migrate deploy &&
        echo 'Running database seed...' &&
        node prisma/seed.mjs &&
        echo 'Migrations and seed completed successfully'
      "
    restart: "no"

  app:
    image: 284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:latest
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - ADMIN_INGEST_KEY=${ADMIN_INGEST_KEY}
      - DOMAIN=${DOMAIN}
      - EMAIL=${EMAIL}
      - NODE_ENV=${NODE_ENV}
      - CRAWLEE_STORAGE_DIR=/tmp/crawlee-storage
    depends_on:
      migrate:
        condition: service_completed_successfully
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

volumes:
  db-data:
```

#### 7. Deploy on EC2
```bash
# On EC2
cd ~/clean-portal

# Pull latest image
docker-compose -f docker-compose.prod.yml --env-file .env.prod pull

# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Start new deployment
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Monitor logs
docker-compose -f docker-compose.prod.yml logs -f app
```

#### 8. Verify Deployment
```bash
# On EC2
curl http://localhost:3000/api/health

# From your machine
curl http://44.198.212.206:3000/api/health
```

---

## PART 4: GITHUB ACTIONS INTEGRATION

Once manual deployment works, GitHub Actions `.github/workflows/deploy.yml` will:
1. **quality-gates**: Run linting and tests
2. **build-and-push**: Build image and push to ECR
3. **migrate**: SSH to EC2, pull image, run migrations
4. **deploy**: SSH to EC2, restart containers

**Current Status**: Workflow exists but EC2 was never properly initialized.

---

## PART 5: TROUBLESHOOTING CHECKLIST

### If App Container Keeps Restarting:
1. Check logs: `docker-compose logs app`
2. Verify ALL environment variables are set
3. Check database connectivity
4. Ensure migrations completed successfully

### If Database Connection Fails:
1. Check `DATABASE_URL` matches PostgreSQL settings
2. Verify database container is healthy
3. Check network connectivity between containers

### If Migrations Fail:
1. Check database credentials
2. Verify Prisma schema is compatible
3. Look for schema drift issues

### If Docker Push Fails:
1. Re-authenticate with ECR
2. Check network connectivity
3. Clear local Docker cache if needed

---

## PART 6: QUICK REFERENCE COMMANDS

### Local Build & Push
```bash
# Build
docker compose --env-file .secrets/.env.prod build --no-cache app

# Tag
docker tag cleanportal-app:latest 284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:latest

# Login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 284077920952.dkr.ecr.us-east-1.amazonaws.com

# Push
docker push 284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:latest
```

### EC2 Deployment
```bash
# SSH
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206

# Pull & Deploy
cd ~/clean-portal
docker-compose -f docker-compose.prod.yml --env-file .env.prod pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Check
curl http://localhost:3000/api/health
docker-compose -f docker-compose.prod.yml logs -f app
```

### Cleanup Commands
```bash
# Local
docker system prune -a

# EC2
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 "docker system prune -a -f"
```

---

## NEXT STEPS

1. ✅ **Generate all secrets** (using commands in Part 3, Step 1)
2. ⏳ **Create `.secrets/.env.prod`** with complete configuration
3. ⏳ **Test local Docker build** to ensure it works
4. ⏳ **Push to ECR**
5. ⏳ **Setup EC2 environment** (copy files, configure)
6. ⏳ **Deploy to EC2**
7. ⏳ **Verify working deployment**
8. ⏳ **Test GitHub Actions workflow**

**Current Blocker**: Need to create complete `.secrets/.env.prod` file with all secrets.


