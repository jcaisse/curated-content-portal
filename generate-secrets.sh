#!/bin/bash
set -euo pipefail

# =============================================================================
# Secret Generation Script for Clean Portal
# =============================================================================
# This script generates all required secrets for production deployment
# 
# Usage: ./generate-secrets.sh
# 
# Output: Prints all secrets to stdout (you can redirect to a file if needed)
# =============================================================================

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    CLEAN PORTAL - SECRET GENERATOR                           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Generating secure secrets for production deployment...${NC}"
echo ""

# Check for openssl
if ! command -v openssl &> /dev/null; then
  echo -e "${RED}✗ openssl not found. Please install openssl.${NC}"
  exit 1
fi

# Generate secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ADMIN_INGEST_KEY=$(openssl rand -base64 32 | tr -d '=' | head -c 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '=')
ADMIN_PASSWORD=$(openssl rand -base64 32 | tr -d '=')

# Display results
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                            GENERATED SECRETS                                 ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC} Copy these values to your .env.ec2 file:                                    ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}# ==============================================================================${NC}"
echo -e "${CYAN}# Critical Secrets - Copy to .env.ec2${NC}"
echo -e "${CYAN}# ==============================================================================${NC}"
echo ""

echo -e "${BLUE}# PostgreSQL Password (20+ chars)${NC}"
echo "POSTGRES_PASSWORD=\"$POSTGRES_PASSWORD\""
echo ""

echo -e "${BLUE}# NextAuth Secret (32+ chars base64)${NC}"
echo "NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\""
echo ""

echo -e "${BLUE}# Admin Ingest Key (32 chars for API authentication)${NC}"
echo "ADMIN_INGEST_KEY=\"$ADMIN_INGEST_KEY\""
echo ""

echo -e "${BLUE}# Admin Password (20+ chars - for initial admin user)${NC}"
echo "ADMIN_PASSWORD=\"$ADMIN_PASSWORD\""
echo ""

echo -e "${CYAN}# ==============================================================================${NC}"
echo -e "${CYAN}# Update DATABASE_URL with your POSTGRES_PASSWORD${NC}"
echo -e "${CYAN}# ==============================================================================${NC}"
echo ""

echo -e "${BLUE}# Full DATABASE_URL (replace with your POSTGRES_PASSWORD)${NC}"
echo "DATABASE_URL=\"postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/curated_content_portal?schema=public\""
echo ""

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                              NEXT STEPS                                      ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC} 1. Copy the secrets above into your .env.ec2 file                           ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} 2. Update DATABASE_URL with the POSTGRES_PASSWORD                           ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} 3. Fill in remaining required fields:                                       ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}    - NEXTAUTH_URL (e.g., http://44.198.212.206:3000)                        ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}    - ADMIN_EMAIL (your admin email)                                         ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}    - OPENAI_API_KEY (your OpenAI API key)                                   ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}    - DOMAIN (e.g., 44.198.212.206)                                          ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}    - EMAIL (system email address)                                           ${GREEN}║${NC}"
echo -e "${GREEN}║${NC} 4. Run deployment: ./deploy-to-ec2.sh                                       ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Optionally save to a temporary file
TEMP_FILE="secrets-$(date +%Y%m%d-%H%M%S).txt"
echo -e "${YELLOW}💾 Optionally saving to temporary file: ${TEMP_FILE}${NC}"
echo ""

cat > "$TEMP_FILE" << EOF
# Clean Portal - Generated Secrets
# Generated: $(date)
# 
# CRITICAL: Delete this file after copying to .env.ec2
# This file contains sensitive secrets that should never be committed to git

# PostgreSQL Password
POSTGRES_PASSWORD="$POSTGRES_PASSWORD"

# NextAuth Secret
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# Admin Ingest Key
ADMIN_INGEST_KEY="$ADMIN_INGEST_KEY"

# Admin Password (for initial admin user)
ADMIN_PASSWORD="$ADMIN_PASSWORD"

# Full DATABASE_URL (with POSTGRES_PASSWORD)
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/curated_content_portal?schema=public"

# =============================================================================
# YOU STILL NEED TO SET THESE IN .env.ec2:
# =============================================================================
# NEXTAUTH_URL="http://44.198.212.206:3000"  # Your public URL
# ADMIN_EMAIL="admin@example.com"  # Your admin email
# OPENAI_API_KEY="sk-..."  # Your OpenAI API key
# DOMAIN="44.198.212.206"  # Your domain or IP
# EMAIL="noreply@example.com"  # System email
EOF

echo -e "${GREEN}✓ Secrets saved to: ${TEMP_FILE}${NC}"
echo -e "${YELLOW}⚠️  REMEMBER: Delete ${TEMP_FILE} after copying to .env.ec2${NC}"
echo ""


