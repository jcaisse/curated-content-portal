#!/bin/bash
set -euo pipefail

# =============================================================================
# Clean Portal - EC2 Deployment Script
# =============================================================================
# This script builds the Docker image locally, pushes to ECR, and deploys to EC2
# 
# Prerequisites:
# 1. AWS CLI configured with proper credentials
# 2. Docker running locally
# 3. .env.ec2 file created with all required variables
# 4. SSH key available at ~/.ssh/clean-portal-deploy
# 5. EC2 instance properly initialized (see DEPLOYMENT_MASTER_PLAN.md)
#
# Usage: ./deploy-to-ec2.sh [--skip-build] [--skip-push]
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="284077920952"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECR_REPO="clean-portal"
EC2_HOST="44.198.212.206"
EC2_USER="ec2-user"
EC2_KEY="$HOME/.ssh/clean-portal-deploy"
EC2_WORKDIR="/home/ec2-user/clean-portal"
ENV_FILE=".env.ec2"

# Parse arguments
SKIP_BUILD=false
SKIP_PUSH=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --skip-push)
      SKIP_PUSH=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [--skip-build] [--skip-push]"
      echo ""
      echo "Options:"
      echo "  --skip-build   Skip Docker image build step"
      echo "  --skip-push    Skip ECR push step"
      echo "  --help         Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Get git commit info
GIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
GIT_SHORT_SHA=$(echo "$GIT_SHA" | cut -c1-8)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    CLEAN PORTAL - EC2 DEPLOYMENT                             ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC} Git Commit:    ${GIT_SHORT_SHA}                                                           ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} Timestamp:     ${TIMESTAMP}                                                    ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} Target:        ${EC2_USER}@${EC2_HOST}                                         ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# STEP 1: Pre-flight Checks
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 1: Pre-flight Checks${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check environment file
if [[ ! -f "$ENV_FILE" ]]; then
  echo -e "${RED}✗ Environment file not found: $ENV_FILE${NC}"
  echo -e "${YELLOW}→ Copy env.ec2.example to $ENV_FILE and fill in all values${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Environment file found${NC}"

# Check Docker
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}✗ Docker is not running${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
  echo -e "${RED}✗ AWS CLI not found${NC}"
  exit 1
fi
echo -e "${GREEN}✓ AWS CLI found${NC}"

# Check SSH key
if [[ ! -f "$EC2_KEY" ]]; then
  echo -e "${RED}✗ SSH key not found: $EC2_KEY${NC}"
  exit 1
fi
echo -e "${GREEN}✓ SSH key found${NC}"

# Check EC2 connectivity
if ! ssh -i "$EC2_KEY" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}" "echo connected" >/dev/null 2>&1; then
  echo -e "${RED}✗ Cannot connect to EC2 instance${NC}"
  exit 1
fi
echo -e "${GREEN}✓ EC2 instance reachable${NC}"

echo ""

# =============================================================================
# STEP 2: Build Docker Image (Optional)
# =============================================================================
if [[ "$SKIP_BUILD" == "false" ]]; then
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}STEP 2: Building Docker Image${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  echo -e "${YELLOW}→ Building image (this may take several minutes)...${NC}"
  if ! docker compose --env-file "$ENV_FILE" build --no-cache app; then
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Image built successfully${NC}"
  
  # Tag image
  IMAGE_ID=$(docker compose --env-file "$ENV_FILE" images app --quiet | head -n1)
  if [[ -n "$IMAGE_ID" ]]; then
    docker tag "$IMAGE_ID" "${ECR_REGISTRY}/${ECR_REPO}:latest"
    docker tag "$IMAGE_ID" "${ECR_REGISTRY}/${ECR_REPO}:${GIT_SHORT_SHA}"
    docker tag "$IMAGE_ID" "${ECR_REGISTRY}/${ECR_REPO}:${TIMESTAMP}"
    echo -e "${GREEN}✓ Image tagged: latest, ${GIT_SHORT_SHA}, ${TIMESTAMP}${NC}"
  else
    echo -e "${RED}✗ Could not get image ID${NC}"
    exit 1
  fi
  
  echo ""
else
  echo -e "${YELLOW}⊘ Skipping build step${NC}"
  echo ""
fi

# =============================================================================
# STEP 3: Push to ECR (Optional)
# =============================================================================
if [[ "$SKIP_PUSH" == "false" ]]; then
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}STEP 3: Pushing to ECR${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # Login to ECR
  echo -e "${YELLOW}→ Logging in to ECR...${NC}"
  if ! aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"; then
    echo -e "${RED}✗ ECR login failed${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Logged in to ECR${NC}"
  
  # Push images
  echo -e "${YELLOW}→ Pushing images to ECR (this may take several minutes)...${NC}"
  
  if ! docker push "${ECR_REGISTRY}/${ECR_REPO}:latest"; then
    echo -e "${RED}✗ Failed to push :latest${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Pushed :latest${NC}"
  
  if ! docker push "${ECR_REGISTRY}/${ECR_REPO}:${GIT_SHORT_SHA}"; then
    echo -e "${RED}✗ Failed to push :${GIT_SHORT_SHA}${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Pushed :${GIT_SHORT_SHA}${NC}"
  
  if ! docker push "${ECR_REGISTRY}/${ECR_REPO}:${TIMESTAMP}"; then
    echo -e "${RED}✗ Failed to push :${TIMESTAMP}${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Pushed :${TIMESTAMP}${NC}"
  
  echo ""
else
  echo -e "${YELLOW}⊘ Skipping push step${NC}"
  echo ""
fi

# =============================================================================
# STEP 4: Copy Files to EC2
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 4: Copying Files to EC2${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Ensure directory exists
ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" "mkdir -p ${EC2_WORKDIR}"
echo -e "${GREEN}✓ Created working directory on EC2${NC}"

# Copy docker-compose file
echo -e "${YELLOW}→ Copying docker-compose.ec2.yml...${NC}"
scp -i "$EC2_KEY" docker-compose.ec2.yml "${EC2_USER}@${EC2_HOST}:${EC2_WORKDIR}/docker-compose.yml"
echo -e "${GREEN}✓ Copied docker-compose.yml${NC}"

# Copy environment file
echo -e "${YELLOW}→ Copying environment file...${NC}"
scp -i "$EC2_KEY" "$ENV_FILE" "${EC2_USER}@${EC2_HOST}:${EC2_WORKDIR}/.env"
echo -e "${GREEN}✓ Copied .env${NC}"

echo ""

# =============================================================================
# STEP 5: Deploy on EC2
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 5: Deploying on EC2${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Login to ECR on EC2
echo -e "${YELLOW}→ Logging in to ECR on EC2...${NC}"
ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" \
  "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
echo -e "${GREEN}✓ ECR login successful on EC2${NC}"

# Pull latest image
echo -e "${YELLOW}→ Pulling latest image on EC2...${NC}"
ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" \
  "cd ${EC2_WORKDIR} && docker-compose pull"
echo -e "${GREEN}✓ Image pulled${NC}"

# Stop existing containers
echo -e "${YELLOW}→ Stopping existing containers...${NC}"
ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" \
  "cd ${EC2_WORKDIR} && docker-compose down --remove-orphans"
echo -e "${GREEN}✓ Containers stopped${NC}"

# Start new deployment
echo -e "${YELLOW}→ Starting new deployment...${NC}"
ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" \
  "cd ${EC2_WORKDIR} && docker-compose up -d"
echo -e "${GREEN}✓ Deployment started${NC}"

echo ""

# =============================================================================
# STEP 6: Verify Deployment
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 6: Verifying Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}→ Waiting for services to start (60 seconds)...${NC}"
sleep 20

# Check migrate service
echo -e "${YELLOW}→ Checking migrate service...${NC}"
MIGRATE_LOGS=$(ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" \
  "cd ${EC2_WORKDIR} && docker-compose logs migrate --no-log-prefix --tail=50")

if echo "$MIGRATE_LOGS" | grep -q "Migration Process Completed Successfully"; then
  echo -e "${GREEN}✓ Migrations completed successfully${NC}"
else
  echo -e "${RED}✗ Migrations may have failed${NC}"
  echo -e "${YELLOW}Migrate logs:${NC}"
  echo "$MIGRATE_LOGS"
fi

sleep 20

# Check app service
echo -e "${YELLOW}→ Checking app service...${NC}"
APP_STATUS=$(ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" \
  "cd ${EC2_WORKDIR} && docker-compose ps app --format '{{.Status}}'")

if echo "$APP_STATUS" | grep -q "Up"; then
  echo -e "${GREEN}✓ App service is running${NC}"
else
  echo -e "${RED}✗ App service is not running${NC}"
  echo "Status: $APP_STATUS"
fi

sleep 10

# Check health endpoint
echo -e "${YELLOW}→ Checking health endpoint...${NC}"
HEALTH_CHECK=$(ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" \
  "curl -sf http://localhost:3000/api/health" 2>&1 || echo "FAILED")

if [[ "$HEALTH_CHECK" != "FAILED" ]]; then
  echo -e "${GREEN}✓ Health check passed${NC}"
  echo "Response: $HEALTH_CHECK"
else
  echo -e "${RED}✗ Health check failed${NC}"
  echo -e "${YELLOW}→ Checking app logs...${NC}"
  ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" \
    "cd ${EC2_WORKDIR} && docker-compose logs app --tail=50"
fi

echo ""

# =============================================================================
# SUCCESS BANNER
# =============================================================================
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                          🎉 DEPLOYMENT COMPLETE! 🎉                          ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC} Application URL:  http://${EC2_HOST}:3000                           ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} Health Check:     http://${EC2_HOST}:3000/api/health                ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} Admin Login:      http://${EC2_HOST}:3000/auth/signin               ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}                                                                              ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} Image Tags:       latest, ${GIT_SHORT_SHA}, ${TIMESTAMP}                    ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} Git Commit:       ${GIT_SHA}  ${GREEN}║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC} Useful Commands:                                                             ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}   View logs:      ssh -i ${EC2_KEY} ${EC2_USER}@${EC2_HOST} \\                ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}                     'cd ${EC2_WORKDIR} && docker-compose logs -f'              ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}   Restart:        ssh -i ${EC2_KEY} ${EC2_USER}@${EC2_HOST} \\                ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}                     'cd ${EC2_WORKDIR} && docker-compose restart'              ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}   Shell access:   ssh -i ${EC2_KEY} ${EC2_USER}@${EC2_HOST}                   ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"


