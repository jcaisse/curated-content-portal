#!/bin/bash
set -euo pipefail

# GitHub Secrets Setup for Clean Portal Deployment
# This script helps configure all required secrets for GitHub Actions deployment

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     GitHub Actions Deployment Setup for Clean Portal        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
  echo "Install it with: brew install gh"
  exit 1
fi

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
  echo -e "${RED}❌ Not logged in to GitHub CLI${NC}"
  echo "Run: gh auth login"
  exit 1
fi

echo -e "${GREEN}✓ GitHub CLI is installed and authenticated${NC}"
echo ""

# Detected values from AWS configuration
AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id 2>/dev/null || echo "")
AWS_REGION="us-east-1"
ECR_REPOSITORY="clean-portal"
EC2_HOST="44.198.212.206"
EC2_USER="ubuntu"
EC2_WORKDIR="/home/ubuntu/clean-portal"

echo -e "${YELLOW}Detected Configuration:${NC}"
echo "  AWS Access Key ID: ${AWS_ACCESS_KEY_ID:0:10}..."
echo "  AWS Region: $AWS_REGION"
echo "  ECR Repository: $ECR_REPOSITORY"
echo "  EC2 Host: $EC2_HOST"
echo "  EC2 User: $EC2_USER"
echo "  EC2 Working Directory: $EC2_WORKDIR"
echo ""

# Function to set secret
set_secret() {
  local name=$1
  local value=$2
  local display_value=$3
  
  if [ -z "$value" ]; then
    echo -e "${RED}❌ $name is empty, skipping${NC}"
    return 1
  fi
  
  echo -e "${BLUE}Setting $name...${NC}"
  if echo "$value" | gh secret set "$name"; then
    echo -e "${GREEN}✓ $name set successfully (${display_value})${NC}"
    return 0
  else
    echo -e "${RED}❌ Failed to set $name${NC}"
    return 1
  fi
}

# Set AWS Access Key ID
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Setting AWS Credentials...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -n "$AWS_ACCESS_KEY_ID" ]; then
  set_secret "AWS_ACCESS_KEY_ID" "$AWS_ACCESS_KEY_ID" "${AWS_ACCESS_KEY_ID:0:10}..."
else
  echo -e "${RED}❌ AWS_ACCESS_KEY_ID not found in AWS configuration${NC}"
  echo "Please run: aws configure"
  exit 1
fi

# AWS Secret Access Key - must be provided manually
echo ""
echo -e "${YELLOW}⚠️  AWS Secret Access Key cannot be retrieved from AWS CLI${NC}"
echo "Please enter your AWS Secret Access Key:"
read -s AWS_SECRET_ACCESS_KEY
echo ""

if [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
  set_secret "AWS_SECRET_ACCESS_KEY" "$AWS_SECRET_ACCESS_KEY" "***hidden***"
else
  echo -e "${RED}❌ AWS_SECRET_ACCESS_KEY is required${NC}"
  echo "You can find it in your AWS IAM console or create a new access key"
  exit 1
fi

# Set AWS Region
set_secret "AWS_REGION" "$AWS_REGION" "$AWS_REGION"

# Set ECR Repository
set_secret "ECR_REPOSITORY" "$ECR_REPOSITORY" "$ECR_REPOSITORY"

# Set EC2 Configuration
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Setting EC2 Configuration...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

set_secret "EC2_HOST" "$EC2_HOST" "$EC2_HOST"
set_secret "EC2_USER" "$EC2_USER" "$EC2_USER"
set_secret "EC2_WORKDIR" "$EC2_WORKDIR" "$EC2_WORKDIR"

# SSH Key
echo ""
echo -e "${YELLOW}⚠️  EC2 SSH Key is required for deployment${NC}"
echo "Available SSH keys:"
ls -1 ~/.ssh/id_* 2>/dev/null | grep -v ".pub" || echo "No SSH keys found"
echo ""
echo "Enter the path to your EC2 SSH private key (or press Enter for ~/.ssh/id_rsa):"
read SSH_KEY_PATH

if [ -z "$SSH_KEY_PATH" ]; then
  SSH_KEY_PATH="$HOME/.ssh/id_rsa"
fi

if [ -f "$SSH_KEY_PATH" ]; then
  SSH_KEY_CONTENT=$(cat "$SSH_KEY_PATH")
  set_secret "EC2_SSH_KEY" "$SSH_KEY_CONTENT" "$(wc -l < "$SSH_KEY_PATH") lines"
else
  echo -e "${RED}❌ SSH key not found at: $SSH_KEY_PATH${NC}"
  echo ""
  echo "To test SSH access to your EC2 instance:"
  echo "  ssh -i $SSH_KEY_PATH ubuntu@$EC2_HOST"
  exit 1
fi

# Verify secrets were set
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Verifying Secrets...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

SECRETS=$(gh secret list)
echo "$SECRETS"

# Check for required secrets
REQUIRED_SECRETS=(
  "AWS_ACCESS_KEY_ID"
  "AWS_SECRET_ACCESS_KEY"
  "AWS_REGION"
  "ECR_REPOSITORY"
  "EC2_HOST"
  "EC2_USER"
  "EC2_SSH_KEY"
  "EC2_WORKDIR"
)

ALL_SET=true
for secret in "${REQUIRED_SECRETS[@]}"; do
  if echo "$SECRETS" | grep -q "^$secret"; then
    echo -e "${GREEN}✓ $secret is set${NC}"
  else
    echo -e "${RED}✗ $secret is NOT set${NC}"
    ALL_SET=false
  fi
done

echo ""
if [ "$ALL_SET" = true ]; then
  echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║           ✓ All secrets configured successfully!            ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${BLUE}Next steps:${NC}"
  echo "  1. Fix any linter errors: npm run lint"
  echo "  2. Test deployment: git commit --allow-empty -m 'test: trigger deployment' && git push"
  echo "  3. Watch deployment: gh run watch"
else
  echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║              ✗ Some secrets are missing!                    ║${NC}"
  echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi

