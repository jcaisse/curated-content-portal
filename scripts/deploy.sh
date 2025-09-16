#!/bin/bash

# Production deployment script for curated-content-portal
set -e

echo "🚀 Starting deployment of Curated Content Portal..."

# Check if running as root (not recommended for production)
if [ "$EUID" -eq 0 ]; then
  echo "⚠️  Warning: Running as root is not recommended for production deployment"
fi

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed. Please install Docker first."
  exit 1
fi

if ! docker info &> /dev/null; then
  echo "❌ Docker daemon is not running. Please start Docker first."
  exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  echo "❌ Docker Compose is not available. Please install Docker Compose first."
  exit 1
fi

# Set compose command
if command -v docker-compose &> /dev/null; then
  COMPOSE_CMD="docker-compose"
else
  COMPOSE_CMD="docker compose"
fi

# Check for required environment variables
if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "❌ NEXTAUTH_SECRET environment variable is required"
  exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "⚠️  Warning: OPENAI_API_KEY is not set. AI features will be disabled."
fi

# Create .env.prod file if it doesn't exist
if [ ! -f .env.prod ]; then
  echo "📝 Creating .env.prod file..."
  cat > .env.prod << EOF
# Production Environment Configuration
NODE_ENV=production
DATABASE_URL=postgresql://curated_user:secure_password_123@postgres:5432/curated_content_portal
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
OPENAI_API_KEY=${OPENAI_API_KEY}
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@example.com}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-secure_password_123}
EOF
  echo "✅ Created .env.prod file. Please review and update as needed."
fi

# Pull latest images
echo "📥 Pulling latest images..."
$COMPOSE_CMD -f docker-compose.prod.yml pull

# Build application image
echo "🔨 Building application..."
$COMPOSE_CMD -f docker-compose.prod.yml build --no-cache app

# Stop existing containers
echo "🛑 Stopping existing containers..."
$COMPOSE_CMD -f docker-compose.prod.yml down

# Start services
echo "🚀 Starting services..."
$COMPOSE_CMD -f docker-compose.prod.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
timeout=60
while ! $COMPOSE_CMD -f docker-compose.prod.yml exec -T postgres pg_isready -U curated_user -d curated_content_portal > /dev/null 2>&1; do
  timeout=$((timeout - 1))
  if [ $timeout -eq 0 ]; then
    echo "❌ Database failed to start within 60 seconds"
    exit 1
  fi
  echo "Waiting for database... ($timeout seconds remaining)"
  sleep 1
done

# Run database migrations
echo "🗄️  Running database migrations..."
$COMPOSE_CMD -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

# Seed database
echo "🌱 Seeding database..."
$COMPOSE_CMD -f docker-compose.prod.yml exec -T app npm run seed

# Health check
echo "🏥 Performing health check..."
sleep 10  # Wait for app to start

for i in {1..30}; do
  if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Application is healthy!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ Health check failed after 30 attempts"
    echo "📋 Checking container logs..."
    $COMPOSE_CMD -f docker-compose.prod.yml logs app
    exit 1
  fi
  echo "Health check attempt $i/30..."
  sleep 2
done

# Display status
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Service Status:"
$COMPOSE_CMD -f docker-compose.prod.yml ps
echo ""
echo "🌐 Application URL: http://localhost:3000"
echo "🔐 Admin Login:"
echo "   Email: ${ADMIN_EMAIL:-admin@example.com}"
echo "   Password: ${ADMIN_PASSWORD:-admin123}"
echo ""
echo "📋 Useful commands:"
echo "   View logs: $COMPOSE_CMD -f docker-compose.prod.yml logs -f app"
echo "   Stop services: $COMPOSE_CMD -f docker-compose.prod.yml down"
echo "   Restart services: $COMPOSE_CMD -f docker-compose.prod.yml restart"
echo ""