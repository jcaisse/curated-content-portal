#!/bin/bash

# Development Setup Script for Curated Content Portal
set -e

echo "🚀 Setting up Curated Content Portal for Development"
echo "=================================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found. Please copy env.example to .env.local first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Setting up database..."

# Check if DATABASE_URL points to a local PostgreSQL
if grep -q "postgresql://" .env.local; then
    echo "⚠️  PostgreSQL detected in DATABASE_URL"
    echo "   Make sure PostgreSQL is running and the database exists:"
    echo "   - Install PostgreSQL locally"
    echo "   - Create database: createdb curated_content"
    echo "   - Or use Docker: docker run -d -p 5432:5432 -e POSTGRES_DB=curated_content -e POSTGRES_PASSWORD=password postgres:16"
    echo ""
    echo "   Alternatively, switch to SQLite by updating .env.local:"
    echo "   DATABASE_URL=\"file:./dev.db\""
    echo ""
    read -p "Press Enter to continue or Ctrl+C to set up database first..."
fi

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "📊 Setting up database schema..."
npx prisma db push

echo "🌱 Seeding database with sample data..."
npx prisma db seed

echo ""
echo "✅ Development setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Update .env.local with your OpenAI API key"
echo "2. Start the development server: npm run dev"
echo "3. Visit http://localhost:3000"
echo "4. Admin login: admin@example.com / admin123"
echo ""
echo "📚 Available commands:"
echo "   npm run dev          - Start development server"
echo "   npm run build        - Build for production"
echo "   npm run test         - Run unit tests"
echo "   npm run test:e2e     - Run e2e tests"
echo "   npm run crawl -- --keyword=\"ai\" --limit=10  - Crawl content"
echo "   npm run curate       - Run AI curation"
echo ""
