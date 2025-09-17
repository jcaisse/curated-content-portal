#!/bin/bash
set -euo pipefail

# Deployment Script for Curated Content Portal
# Usage: bash ops/deploy.sh --env-file <env-file>
# Default: --env-file ./.secrets/.env.local

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENV_FILE="./.secrets/.env.local"
ENVIRONMENT="${ENVIRONMENT:-local}"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 [--env-file <env-file>]"
      echo "Default env-file: ./.secrets/.env.local"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Validate environment file exists
if [[ ! -f "$ENV_FILE" ]]; then
  echo -e "${RED}❌ Environment file not found: $ENV_FILE${NC}"
  exit 1
fi

# Get git commit SHA for labeling
GIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
GIT_SHORT_SHA=$(echo "$GIT_SHA" | cut -c1-8)

echo -e "${BLUE}🚀 Starting deployment for environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}📁 Using env file: $ENV_FILE${NC}"
echo -e "${BLUE}🔖 Git commit: $GIT_SHORT_SHA${NC}"
echo ""

# Step 1: Clean Start
echo -e "${YELLOW}🧹 Step 1: Clean start${NC}"
docker compose down --remove-orphans || true
echo -e "${GREEN}✅ Clean start completed${NC}"
echo ""

# Step 2: Preflight Checks
echo -e "${YELLOW}🔍 Step 2: Preflight checks${NC}"
if ! npm run ci:preflight; then
  echo -e "${RED}❌ Preflight checks failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Preflight checks passed${NC}"
echo ""

# Step 3: Build Fresh Image
echo -e "${YELLOW}🔨 Step 3: Building fresh image${NC}"
if ! docker compose --env-file "$ENV_FILE" build --no-cache --pull app; then
  echo -e "${RED}❌ Image build failed${NC}"
  exit 1
fi

# Label image with commit SHA
IMAGE_ID=$(docker compose --env-file "$ENV_FILE" images app --quiet)
if [[ -n "$IMAGE_ID" ]]; then
  docker tag "$IMAGE_ID" "cleanportal-app:$GIT_SHORT_SHA"
  echo -e "${GREEN}✅ Image built and labeled: cleanportal-app:$GIT_SHORT_SHA${NC}"
else
  echo -e "${YELLOW}⚠️  Could not get image ID for labeling${NC}"
fi
echo ""

# Step 4: Prove Image Integrity
echo -e "${YELLOW}🔬 Step 4: Proving image integrity${NC}"
if ! npm run ci:prove-image; then
  echo -e "${RED}❌ Image integrity check failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Image integrity verified${NC}"
echo ""

# Step 5: Deploy Stack
echo -e "${YELLOW}🚀 Step 5: Deploying stack${NC}"
if ! docker compose --env-file "$ENV_FILE" up -d --force-recreate --remove-orphans; then
  echo -e "${RED}❌ Stack deployment failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Stack deployed${NC}"
echo ""

# Step 6: Wait for Services and Verify
echo -e "${YELLOW}⏳ Step 6: Waiting for services to be ready${NC}"

# Wait for database to be healthy
echo "Waiting for database to be healthy..."
timeout=60
while [[ $timeout -gt 0 ]]; do
  if docker compose --env-file "$ENV_FILE" ps db | grep -q "healthy"; then
    echo -e "${GREEN}✅ Database is healthy${NC}"
    break
  fi
  sleep 2
  timeout=$((timeout - 2))
done

if [[ $timeout -le 0 ]]; then
  echo -e "${RED}❌ Database failed to become healthy within 60 seconds${NC}"
  exit 1
fi

# Wait for migrate service to complete
echo "Waiting for migrate service to complete..."
timeout=120
while [[ $timeout -gt 0 ]]; do
  MIGRATE_STATUS=$(docker compose --env-file "$ENV_FILE" ps migrate --format "table {{.Status}}" | tail -n +2 || echo "")
  if [[ "$MIGRATE_STATUS" == *"Exited (0)"* ]]; then
    echo -e "${GREEN}✅ Migrate service completed successfully${NC}"
    break
  elif [[ "$MIGRATE_STATUS" == *"Exited"* ]]; then
    echo -e "${RED}❌ Migrate service failed${NC}"
    docker compose --env-file "$ENV_FILE" logs migrate
    exit 1
  fi
  sleep 2
  timeout=$((timeout - 2))
done

if [[ $timeout -le 0 ]]; then
  echo -e "${YELLOW}⚠️  Migrate service did not complete within 120 seconds, checking logs...${NC}"
  docker compose --env-file "$ENV_FILE" logs migrate --tail=20
  # Check if migrate actually succeeded by looking at logs
  if docker compose --env-file "$ENV_FILE" logs migrate | grep -q "Migrations, seed, fingerprint check, and smoke test completed successfully"; then
    echo -e "${GREEN}✅ Migrate service actually completed successfully (found in logs)${NC}"
  else
    echo -e "${RED}❌ Migrate service failed${NC}"
    exit 1
  fi
fi

# Wait for app service to be ready
echo "Waiting for app service to be ready..."
timeout=60
while [[ $timeout -gt 0 ]]; do
  if curl -sf http://localhost:3000/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ App service is ready${NC}"
    break
  fi
  sleep 2
  timeout=$((timeout - 2))
done

if [[ $timeout -le 0 ]]; then
  echo -e "${RED}❌ App service failed to become ready within 60 seconds${NC}"
  exit 1
fi

echo ""

# Step 7: Final Verification
echo -e "${YELLOW}🔍 Step 7: Final verification${NC}"

# Check migrate logs for success indicators
echo "Checking migrate service logs..."
MIGRATE_LOGS=$(docker compose --env-file "$ENV_FILE" logs migrate --no-log-prefix)
if echo "$MIGRATE_LOGS" | grep -q "Migrations, seed, fingerprint check, and smoke test completed successfully"; then
  echo -e "${GREEN}✅ Migrate: All steps completed successfully${NC}"
else
  echo -e "${RED}❌ Migrate: Missing success indicators${NC}"
  echo "$MIGRATE_LOGS"
  exit 1
fi

# Check app logs for ready indicator
echo "Checking app service logs..."
APP_LOGS=$(docker compose --env-file "$ENV_FILE" logs app --no-log-prefix)
if echo "$APP_LOGS" | grep -q "Ready in"; then
  echo -e "${GREEN}✅ App: Service is ready${NC}"
else
  echo -e "${RED}❌ App: Missing ready indicator${NC}"
  echo "$APP_LOGS"
  exit 1
fi

# Test HTTP endpoint
echo "Testing HTTP endpoint..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [[ "$HTTP_STATUS" == "200" ]]; then
  echo -e "${GREEN}✅ HTTP: Application responding (200 OK)${NC}"
else
  echo -e "${RED}❌ HTTP: Application not responding correctly (status: $HTTP_STATUS)${NC}"
  exit 1
fi

echo ""

# Success Banner
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                            🎉 DEPLOYMENT SUCCESS! 🎉                      ║"
echo "╠══════════════════════════════════════════════════════════════════════════════╣"
echo "║ Environment: $ENVIRONMENT"
echo "║ Image Label: cleanportal-app:$GIT_SHORT_SHA"
echo "║ Git Commit:  $GIT_SHA"
echo "║ Application: http://localhost:3000"
echo "║ Admin Login: admin@example.com"
echo "║                                                                              ║"
echo "║ ✅ CSS present in image                                                      ║"
echo "║ ✅ Migrations applied successfully                                           ║"
echo "║ ✅ Admin user seeded                                                         ║"
echo "║ ✅ Auth fingerprint verified                                                ║"
echo "║ ✅ Database smoke test passed                                                ║"
echo "║ ✅ Application responding                                                    ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
