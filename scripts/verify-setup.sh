#!/bin/bash

# Verification script for Curated Content Portal
# This script verifies that all components are properly configured

set -e

echo "🔍 Verifying Curated Content Portal Setup..."
echo "=============================================="

# Check if required files exist
echo "📁 Checking project structure..."

required_files=(
    "package.json"
    "docker-compose.yml"
    "Dockerfile"
    "Dockerfile.test"
    "prisma/schema.prisma"
    "src/app/layout.tsx"
    "src/lib/db.ts"
    "src/lib/auth.ts"
    "scripts/crawl.ts"
    "scripts/curate.ts"
    "scripts/deploy.sh"
    "README.md"
    ".github/workflows/ci.yml"
    ".github/workflows/release.yml"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
        exit 1
    fi
done

# Check if dependencies are installed
echo ""
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
else
    echo "❌ node_modules not found. Run 'npm install'"
    exit 1
fi

# Check TypeScript compilation
echo ""
echo "🔧 Checking TypeScript compilation..."
if npx tsc --noEmit; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Check if Prisma client can be generated
echo ""
echo "🗄️  Checking Prisma setup..."
if npx prisma generate; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Prisma client generation failed"
    exit 1
fi

# Check Docker setup
echo ""
echo "🐳 Checking Docker configuration..."
if docker --version > /dev/null 2>&1; then
    echo "✅ Docker is available"
    
    # Check if docker-compose.yml is valid
    if docker compose config > /dev/null 2>&1; then
        echo "✅ docker-compose.yml is valid"
    else
        echo "❌ docker-compose.yml has errors"
        exit 1
    fi
else
    echo "⚠️  Docker not available (expected in some environments)"
fi

# Check environment files
echo ""
echo "⚙️  Checking environment configuration..."
if [ -f "env.example" ]; then
    echo "✅ env.example exists"
else
    echo "❌ env.example missing"
    exit 1
fi

if [ -f "env.prod.example" ]; then
    echo "✅ env.prod.example exists"
else
    echo "❌ env.prod.example missing"
    exit 1
fi

# Check test setup
echo ""
echo "🧪 Checking test setup..."
if [ -f "vitest.config.ts" ]; then
    echo "✅ Vitest configuration exists"
else
    echo "❌ Vitest configuration missing"
    exit 1
fi

if [ -f "playwright.config.ts" ]; then
    echo "✅ Playwright configuration exists"
else
    echo "❌ Playwright configuration missing"
    exit 1
fi

# Check GitHub Actions
echo ""
echo "🚀 Checking CI/CD setup..."
if [ -d ".github/workflows" ]; then
    echo "✅ GitHub Actions workflows directory exists"
    if [ -f ".github/workflows/ci.yml" ]; then
        echo "✅ CI workflow exists"
    fi
    if [ -f ".github/workflows/release.yml" ]; then
        echo "✅ Release workflow exists"
    fi
else
    echo "❌ GitHub Actions workflows missing"
    exit 1
fi

# Check deployment script
echo ""
echo "🚢 Checking deployment setup..."
if [ -f "scripts/deploy.sh" ] && [ -x "scripts/deploy.sh" ]; then
    echo "✅ Deployment script exists and is executable"
else
    echo "❌ Deployment script missing or not executable"
    exit 1
fi

echo ""
echo "🎉 All checks passed! The Curated Content Portal is ready to deploy."
echo ""
echo "Next steps:"
echo "1. Copy env.example to .env.local and configure your environment"
echo "2. Start development: make compose-dev"
echo "3. Or deploy to production: ./scripts/deploy.sh your-server.com deploy-user my-app"
echo ""
echo "For more information, see README.md"
