#!/bin/bash
set -euo pipefail

# EC2 Production Deployment Script
# This script properly deploys to EC2 using the standard Docker build process

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

EC2_INSTANCE_ID="${EC2_INSTANCE_ID:-i-05efc928b83a2e0ab}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo -e "${BLUE}🚀 Starting EC2 Production Deployment${NC}"
echo -e "${BLUE}📍 Instance: $EC2_INSTANCE_ID${NC}"
echo -e "${BLUE}🌎 Region: $AWS_REGION${NC}"
echo ""

# Get git commit SHA
GIT_SHA=$(git rev-parse HEAD)
GIT_SHORT_SHA=$(echo "$GIT_SHA" | cut -c1-8)
echo -e "${BLUE}🔖 Deploying commit: $GIT_SHORT_SHA${NC}"
echo ""

# Step 1: Build Docker image locally
echo -e "${YELLOW}📦 Step 1: Building Docker image locally${NC}"
if ! docker build \
  --build-arg NODE_VERSION=20 \
  --build-arg GIT_COMMIT_SHA="$GIT_SHA" \
  -t "cleanportal-app:$GIT_SHORT_SHA" \
  -t "cleanportal-app:latest" \
  .; then
  echo -e "${RED}❌ Docker build failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Image built successfully${NC}"
echo ""

# Step 2: Save and compress image
echo -e "${YELLOW}💾 Step 2: Saving image to tarball${NC}"
TEMP_DIR=$(mktemp -d)
IMAGE_FILE="$TEMP_DIR/cleanportal-app.tar.gz"
if ! docker save "cleanportal-app:latest" | gzip > "$IMAGE_FILE"; then
  echo -e "${RED}❌ Failed to save image${NC}"
  exit 1
fi
IMAGE_SIZE=$(du -h "$IMAGE_FILE" | cut -f1)
echo -e "${GREEN}✅ Image saved ($IMAGE_SIZE)${NC}"
echo ""

# Step 3: Upload to S3
echo -e "${YELLOW}☁️  Step 3: Uploading to S3${NC}"
S3_BUCKET="ai-portal-generator-content-bucket-dev"
S3_KEY="deployments/cleanportal-app-$GIT_SHORT_SHA.tar.gz"
if ! aws s3 cp "$IMAGE_FILE" "s3://$S3_BUCKET/$S3_KEY" --region "$AWS_REGION"; then
  echo -e "${RED}❌ S3 upload failed${NC}"
  exit 1
fi
# Also upload as "latest"
aws s3 cp "$IMAGE_FILE" "s3://$S3_BUCKET/deployments/cleanportal-app-latest.tar.gz" --region "$AWS_REGION"
echo -e "${GREEN}✅ Image uploaded to S3${NC}"
echo ""

# Cleanup temp file
rm -rf "$TEMP_DIR"

# Step 4: Deploy to EC2
echo -e "${YELLOW}🚀 Step 4: Deploying to EC2${NC}"

# Create deployment script for EC2 (no emojis for AWS CLI compatibility)
DEPLOY_SCRIPT='#!/bin/bash
set -e

echo Downloading Docker image from S3...
aws s3 cp s3://ai-portal-generator-content-bucket-dev/deployments/cleanportal-app-latest.tar.gz /tmp/cleanportal-app.tar.gz --region us-east-1

echo Loading Docker image...
docker load -i /tmp/cleanportal-app.tar.gz

echo Verifying image...
docker images cleanportal-app:latest

echo Stopping old containers...
docker stop curated-content-app curated-content-scheduler curated-content-migrate 2>/dev/null || true
docker rm curated-content-app curated-content-scheduler curated-content-migrate 2>/dev/null || true

echo Starting services with new image...
cd ~
export APP_IMAGE=cleanportal-app:latest

# Start database if not running
docker ps | grep curated-content-postgres || docker start curated-content-postgres

# Wait for DB
sleep 5

# Run migrations
docker run --rm --name curated-content-migrate --network curated-content-portal_curated-network --env-file ~/.env cleanportal-app:latest /bin/sh -c "node node_modules/.bin/prisma migrate deploy && node prisma/seed.mjs && node scripts/auth-fingerprint-check.mjs && node scripts/db-smoke.mjs"

# Start app
docker run -d --name curated-content-app --network curated-content-portal_curated-network --env-file ~/.env -e NODE_ENV=production -e CRAWLEE_STORAGE_DIR=/tmp/crawlee-storage -p 3000:3000 --restart unless-stopped cleanportal-app:latest

# Start scheduler
docker run -d --name curated-content-scheduler --network curated-content-portal_curated-network --env-file ~/.env -e NODE_ENV=production --restart unless-stopped cleanportal-app:latest node scripts/scheduler.mjs

echo Waiting for app to start...
sleep 15

echo Checking app logs...
docker logs curated-content-app --tail 30

echo Deployment complete!
docker ps --filter name=curated-content

echo Testing endpoint...
curl -I http://localhost:3000 || echo App not responding yet
'

# Send and execute deployment script on EC2
COMMAND_ID=$(aws ssm send-command \
  --instance-ids "$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Deploy Corsoro Marketing Website - Commit $GIT_SHORT_SHA" \
  --parameters "commands=[\"$DEPLOY_SCRIPT\"]" \
  --region "$AWS_REGION" \
  --output text \
  --query 'Command.CommandId')

echo -e "${BLUE}📡 Deployment command sent: $COMMAND_ID${NC}"
echo -e "${BLUE}⏳ Waiting for deployment to complete...${NC}"
echo ""

# Wait for command to complete
sleep 45

# Get command status
STATUS=$(aws ssm get-command-invocation \
  --command-id "$COMMAND_ID" \
  --instance-id "$EC2_INSTANCE_ID" \
  --region "$AWS_REGION" \
  --query '[Status,StandardOutputContent,StandardErrorContent]' \
  --output text)

echo "$STATUS" | head -100

if echo "$STATUS" | grep -q "Success"; then
  echo ""
  echo -e "${GREEN}"
  echo "╔══════════════════════════════════════════════════════════════════════════════╗"
  echo "║                      🎉 EC2 DEPLOYMENT SUCCESS! 🎉                          ║"
  echo "╠══════════════════════════════════════════════════════════════════════════════╣"
  echo "║ Instance:    $EC2_INSTANCE_ID"
  echo "║ Commit:      $GIT_SHORT_SHA"
  echo "║ Image:       cleanportal-app:latest"
  echo "║                                                                              ║"
  echo "║ 🌐 Site:     https://portal.spoot.com"
  echo "║ 🌐 WWW:      https://www.spoot.com"
  echo "║                                                                              ║"
  echo "║ ✅ Docker image built                                                        ║"
  echo "║ ✅ Image uploaded to S3                                                      ║"
  echo "║ ✅ Deployed to EC2                                                           ║"
  echo "║ ✅ Services started                                                          ║"
  echo "╚══════════════════════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
else
  echo -e "${RED}❌ Deployment failed on EC2${NC}"
  exit 1
fi
