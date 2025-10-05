#!/bin/bash
# Hot reload development - sync local changes to EC2

set -e

EC2_HOST="ec2-user@44.198.212.206"
EC2_PATH="/home/ec2-user/clean-portal"
SSH_KEY="$HOME/.ssh/clean-portal-deploy"

echo "🔄 Starting file sync to EC2 (dev mode)..."
echo "📁 Watching for changes in: src/, public/, prisma/"
echo "🎯 Syncing to: $EC2_HOST:$EC2_PATH"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Use fswatch (macOS) or inotifywait (Linux) to watch for changes
if command -v fswatch &> /dev/null; then
    # macOS
    fswatch -o src/ public/ prisma/ package.json next.config.js tsconfig.json tailwind.config.ts | while read; do
        echo "📝 Change detected, syncing..."
        rsync -avz --delete \
            -e "ssh -i $SSH_KEY" \
            --exclude 'node_modules' \
            --exclude '.next' \
            --exclude '.git' \
            src/ public/ prisma/ package.json next.config.js tsconfig.json tailwind.config.ts postcss.config.js \
            $EC2_HOST:$EC2_PATH/
        echo "✅ Sync complete at $(date '+%H:%M:%S')"
    done
else
    echo "⚠️  fswatch not found. Installing..."
    echo "Run: brew install fswatch"
    echo ""
    echo "Or use manual sync:"
    echo "  ./scripts/dev-sync-manual.sh"
    exit 1
fi
