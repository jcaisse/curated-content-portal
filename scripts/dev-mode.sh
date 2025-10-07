#!/bin/bash
# Switch EC2 to development mode

set -e

EC2_HOST="ec2-user@44.198.212.206"
SSH_KEY="$HOME/.ssh/clean-portal-deploy"

echo "🔧 Switching to DEV mode on EC2..."
echo ""

ssh -i $SSH_KEY $EC2_HOST << 'ENDSSH'
cd ~/clean-portal

# Stop production
echo "⏹️  Stopping production containers..."
docker-compose down

# Start dev mode
echo "🚀 Starting development mode..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for app to be ready
echo "⏳ Waiting for app to start..."
sleep 10

# Show logs
echo ""
echo "📋 Recent logs:"
docker-compose -f docker-compose.dev.yml logs --tail=20 app

echo ""
echo "✅ Dev mode is running!"
echo "🌐 Access at: https://portal.spoot.com"
echo ""
echo "To sync your local changes:"
echo "  ./scripts/dev-sync-manual.sh"
echo ""
echo "To watch for changes automatically:"
echo "  ./scripts/dev-sync.sh"
ENDSSH

echo ""
echo "✅ EC2 is now in DEV mode!"
