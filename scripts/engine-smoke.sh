#!/usr/bin/env sh
set -e

echo "🔍 Prisma engine smoke test..."

echo "Node platform info:"
node -e "console.log('Node:', process.platform, process.arch)"

echo "Prisma version:"
node node_modules/.bin/prisma -v

echo "Prisma client load test:"
node -e "require('@prisma/client'); console.log('✅ Prisma client loaded OK');"

echo "✅ Engine smoke test passed"

