#!/bin/bash

# Health check script for curated-content-portal
set -e

echo "🏥 Performing health checks for Curated Content Portal..."

# Check if application is responding
echo "1. Checking application health endpoint..."
if curl -f -s http://localhost:3000/api/health > /dev/null; then
  echo "   ✅ Application is healthy"
else
  echo "   ❌ Application health check failed"
  exit 1
fi

# Check database connectivity
echo "2. Checking database connectivity..."
if docker exec curated-content-postgres pg_isready -U curated_user -d curated_content_portal > /dev/null 2>&1; then
  echo "   ✅ Database is accessible"
else
  echo "   ❌ Database connectivity check failed"
  exit 1
fi

# Check Redis connectivity
echo "3. Checking Redis connectivity..."
if docker exec curated-content-redis redis-cli ping > /dev/null 2>&1; then
  echo "   ✅ Redis is accessible"
else
  echo "   ❌ Redis connectivity check failed"
  exit 1
fi

# Check if admin routes are protected
echo "4. Checking authentication protection..."
if curl -f -s http://localhost:3000/api/admin/keywords > /dev/null; then
  echo "   ❌ Admin routes are not properly protected"
  exit 1
else
  echo "   ✅ Admin routes are properly protected"
fi

# Check if public routes are accessible
echo "5. Checking public routes..."
if curl -f -s http://localhost:3000/ > /dev/null; then
  echo "   ✅ Public routes are accessible"
else
  echo "   ❌ Public routes are not accessible"
  exit 1
fi

echo ""
echo "🎉 All health checks passed!"
echo "🌐 Application is running at: http://localhost:3000"
echo ""
