#!/bin/bash

# Secret rotation script for different environments
# Usage: ./scripts/rotate-secrets.sh [dev|staging|prod]

set -euo pipefail

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Generate new secrets
generate_secrets() {
    log_info "Generating new secrets..."
    
    # Generate secrets using Node.js script
    NEXTAUTH_SECRET=$(node "$SCRIPT_DIR/gensecret.mjs" nextauth | cut -d'=' -f2)
    POSTGRES_PASSWORD=$(node "$SCRIPT_DIR/gensecret.mjs" postgres | cut -d'=' -f2)
    ADMIN_PASSWORD=$(node "$SCRIPT_DIR/gensecret.mjs" admin | cut -d'=' -f2)
    ADMIN_INGEST_KEY=$(node "$SCRIPT_DIR/gensecret.mjs" ingest | cut -d'=' -f2)
    
    log_success "Secrets generated successfully"
}

# Update environment file
update_env_file() {
    local env_file="$1"
    
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    
    log_info "Updating $env_file..."
    
    # Create backup
    cp "$env_file" "$env_file.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Update secrets in the file
    sed -i.tmp "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$NEXTAUTH_SECRET/" "$env_file"
    sed -i.tmp "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" "$env_file"
    sed -i.tmp "s/ADMIN_PASSWORD=.*/ADMIN_PASSWORD=$POSTGRES_PASSWORD/" "$env_file"
    sed -i.tmp "s/ADMIN_INGEST_KEY=.*/ADMIN_INGEST_KEY=$ADMIN_INGEST_KEY/" "$env_file"
    
    # Clean up temporary file
    rm -f "$env_file.tmp"
    
    log_success "Environment file updated"
}

# Rotate development secrets
rotate_dev() {
    log_info "Rotating development secrets..."
    
    local env_file="$PROJECT_ROOT/.secrets/.env.local"
    
    if [[ ! -f "$env_file" ]]; then
        log_warning "Development environment file not found. Creating from template..."
        mkdir -p "$(dirname "$env_file")"
        cp "$PROJECT_ROOT/.env.development" "$env_file"
    fi
    
    generate_secrets
    update_env_file "$env_file"
    
    log_info "To apply changes:"
    echo "  1. docker compose down"
    echo "  2. docker volume rm cleanportal_postgres_data  # This will delete all data!"
    echo "  3. docker compose up -d --build"
    echo "  4. docker compose exec app npx prisma migrate deploy"
    echo "  5. docker compose exec app npx prisma db seed"
}

# Rotate staging secrets
rotate_staging() {
    log_info "Rotating staging secrets..."
    
    local env_file="$PROJECT_ROOT/.env.staging"
    
    if [[ ! -f "$env_file" ]]; then
        log_error "Staging environment file not found: $env_file"
        log_info "Create it from .env.staging.example first"
        return 1
    fi
    
    generate_secrets
    update_env_file "$env_file"
    
    log_warning "Staging secrets rotated. Manual deployment required."
    log_info "Update your CI/CD pipeline with the new secrets."
}

# Rotate production secrets
rotate_prod() {
    log_error "Production secret rotation requires manual intervention!"
    log_info "For production:"
    echo "  1. Generate new secrets manually"
    echo "  2. Update production environment variables"
    echo "  3. Restart services"
    echo "  4. Verify functionality"
    echo "  5. Update backup systems"
    
    log_warning "Never automate production secret rotation without proper procedures!"
}

# Main execution
main() {
    log_info "Secret rotation for environment: $ENVIRONMENT"
    
    case "$ENVIRONMENT" in
        dev|development)
            rotate_dev
            ;;
        staging)
            rotate_staging
            ;;
        prod|production)
            rotate_prod
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            echo "Usage: $0 [dev|staging|prod]"
            exit 1
            ;;
    esac
    
    log_success "Secret rotation completed for $ENVIRONMENT"
}

# Run main function
main "$@"
