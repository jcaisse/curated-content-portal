#!/bin/bash
# Switch EC2 back to production mode

set -e

EC2_HOST="ec2-user@44.198.212.206"
SSH_KEY="$HOME/.ssh/clean-portal-deploy"

echo "🔧 Switching to PRODUCTION mode on EC2..."
echo ""

ssh -i $SSH_KEY $EC2_HOST << 'ENDSSH'
cd ~/clean-portal

# Stop dev mode
echo "⏹️  Stopping development containers..."
docker-compose -f docker-compose.dev.yml down

# Start production
echo "🚀 Starting production mode..."
docker-compose up -d

# Wait for app to be ready
echo "⏳ Waiting for app to start..."
sleep 10

# Show logs
echo ""
echo "📋 Recent logs:"
docker-compose logs --tail=20 app

echo ""
echo "✅ Production mode is running!"
echo "🌐 Access at: https://portal.spoot.com"
ENDSSH

echo ""
echo "✅ EC2 is now in PRODUCTION mode!"
