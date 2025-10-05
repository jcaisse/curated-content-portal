#!/bin/bash
# Manual one-time sync to EC2

set -e

EC2_HOST="ec2-user@44.198.212.206"
EC2_PATH="/home/ec2-user/clean-portal"
SSH_KEY="$HOME/.ssh/clean-portal-deploy"

echo "🔄 Syncing files to EC2..."

rsync -avz --delete \
    -e "ssh -i $SSH_KEY" \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude 'test-results' \
    --exclude 'playwright-report' \
    src/ public/ prisma/ package.json next.config.js tsconfig.json tailwind.config.ts postcss.config.js \
    $EC2_HOST:$EC2_PATH/

echo "✅ Sync complete!"
echo ""
echo "To see changes, make sure dev mode is running on EC2:"
echo "  ssh -i $SSH_KEY $EC2_HOST 'cd $EC2_PATH && docker-compose -f docker-compose.dev.yml up -d'"
