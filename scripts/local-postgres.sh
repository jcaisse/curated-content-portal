#!/usr/bin/env bash

# Local PostgreSQL setup and runbook
set -euo pipefail

echo "🚀 Starting Curated Content Portal with PostgreSQL..."

# Check if Docker is running
if ! docker info &> /dev/null; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

# Check for required environment variables
if [ -z "${NEXTAUTH_SECRET:-}" ]; then
  echo "⚠️  NEXTAUTH_SECRET not set, using default (not recommended for production)"
  export NEXTAUTH_SECRET="dev-secret-key-change-in-production"
fi

# Set default environment variables
export POSTGRES_USER="${POSTGRES_USER:-postgres}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
export POSTGRES_DB="${POSTGRES_DB:-curated_content_portal}"
export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
export APP_PORT="${APP_PORT:-3000}"

echo "📋 Configuration:"
echo "   - PostgreSQL: ${POSTGRES_USER}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}"
echo "   - App URL: http://localhost:${APP_PORT}"
echo "   - Admin Email: ${ADMIN_EMAIL:-admin@example.com}"
echo "   - Admin Password: ${ADMIN_PASSWORD:-admin123}"

# Start services
echo "🐳 Starting Docker services..."
docker compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
timeout=60
while ! docker compose exec -T db pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} > /dev/null 2>&1; do
  timeout=$((timeout - 1))
  if [ $timeout -eq 0 ]; then
    echo "❌ Database failed to start within 60 seconds"
    docker compose logs db
    exit 1
  fi
  echo "   Waiting for database... ($timeout seconds remaining)"
  sleep 1
done

echo "✅ Database is ready!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
docker compose exec -T app npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
docker compose exec -T app npx prisma migrate deploy

# Seed database
echo "🌱 Seeding database..."
docker compose exec -T app npm run seed || echo "⚠️  Seeding failed or already done"

# Wait for app to be ready
echo "⏳ Waiting for application to start..."
timeout=60
while ! curl -f -s http://localhost:${APP_PORT}/api/health > /dev/null 2>&1; do
  timeout=$((timeout - 1))
  if [ $timeout -eq 0 ]; then
    echo "❌ Application failed to start within 60 seconds"
    docker compose logs app
    exit 1
  fi
  echo "   Waiting for application... ($timeout seconds remaining)"
  sleep 2
done

echo ""
echo "🎉 Curated Content Portal is ready!"
echo ""
echo "📊 Service Status:"
docker compose ps
echo ""
echo "🌐 URLs:"
echo "   Public: http://localhost:${APP_PORT}/"
echo "   Admin:  http://localhost:${APP_PORT}/admin"
echo "   Health: http://localhost:${APP_PORT}/api/health"
echo ""
echo "🔐 Admin Login:"
echo "   Email: ${ADMIN_EMAIL:-admin@example.com}"
echo "   Password: ${ADMIN_PASSWORD:-admin123}"
echo ""
echo "📋 Useful Commands:"
echo "   View logs: docker compose logs -f"
echo "   Stop services: docker compose down"
echo "   Restart: docker compose restart"
echo "   Database shell: docker compose exec db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}"
echo "   App shell: docker compose exec app sh"
echo ""
echo "🔍 Health Check:"
curl -s http://localhost:${APP_PORT}/api/health | jq . 2>/dev/null || curl -s http://localhost:${APP_PORT}/api/health
echo ""
