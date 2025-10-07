# 🚀 Hot Reload Development Mode

This guide explains how to use the new hot reload development workflow for instant updates on EC2.

## 📋 Overview

**Before (slow):**
1. Edit code locally
2. Build Docker image (5-10 min)
3. Push to ECR (2-5 min)
4. Deploy to EC2 (2-3 min)
**Total: 10-20 minutes** 😫

**After (fast):**
1. Edit code locally
2. Sync to EC2 (2-5 sec)
3. Next.js hot reload (instant)
**Total: 2-5 seconds** 🚀

---

## 🎯 Quick Start

### 1. Switch EC2 to Dev Mode
```bash
./scripts/dev-mode.sh
```
This stops production containers and starts dev mode with hot reload.

### 2. Sync Your Code (Choose One)

**Option A: Manual Sync (recommended for testing)**
```bash
./scripts/dev-sync-manual.sh
```
Syncs once and exits.

**Option B: Auto-Sync (watch mode)**
```bash
# First install fswatch (one-time)
brew install fswatch

# Then start watching
./scripts/dev-sync.sh
```
Automatically syncs whenever you save a file.

### 3. Make Changes
- Edit any file in `src/`, `public/`, or `prisma/`
- Save the file
- Changes appear on https://portal.spoot.com in ~2-5 seconds

### 4. Switch Back to Production
```bash
./scripts/prod-mode.sh
```
Stops dev mode and restarts production containers.

---

## 📁 What Gets Synced

These directories/files are synced:
- ✅ `src/` (all app code)
- ✅ `public/` (static assets)
- ✅ `prisma/` (database schema)
- ✅ `package.json`
- ✅ `next.config.js`
- ✅ `tsconfig.json`
- ✅ `tailwind.config.ts`
- ✅ `postcss.config.js`

These are NOT synced (performance):
- ❌ `node_modules/` (installed on EC2)
- ❌ `.next/` (built on EC2)
- ❌ `.git/` (not needed)

---

## 🔧 Troubleshooting

### Changes not appearing?
```bash
# Check dev mode is running
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  'docker ps | grep dev'

# Check app logs
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  'cd ~/clean-portal && docker-compose -f docker-compose.dev.yml logs --tail=50 app'

# Restart dev mode
./scripts/dev-mode.sh
```

### Sync failing?
```bash
# Test SSH connection
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 'echo "Connection OK"'

# Manual sync with verbose output
rsync -avz --delete \
  -e "ssh -i ~/.ssh/clean-portal-deploy" \
  --exclude 'node_modules' \
  --exclude '.next' \
  src/ public/ prisma/ \
  ec2-user@44.198.212.206:/home/ec2-user/clean-portal/
```

### Need to install dependencies?
```bash
# SSH to EC2 and rebuild node_modules
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206
cd ~/clean-portal
docker-compose -f docker-compose.dev.yml exec app npm install
```

---

## ⚠️ Important Notes

1. **Dev mode uses different ports:**
   - Database: `5434` (prod: `5432`)
   - Redis: `6380` (prod: `6379`)
   - Caddy HTTP: `8080` (prod: `80`)
   - Caddy HTTPS: `8443` (prod: `443`)

2. **Dev mode uses separate volumes:**
   - `db-data-dev` (separate from prod data)
   - `redis_data_dev`
   - `caddy_data_dev`

3. **Environment:**
   - Uses same `.env` file as production
   - Sets `NODE_ENV=development`

4. **When to use production mode:**
   - Before major releases
   - When testing production builds
   - When you need production performance

---

## 🎨 Workflow Examples

### Example 1: Quick UI Fix
```bash
# 1. Switch to dev mode
./scripts/dev-mode.sh

# 2. Edit file
code src/app/admin/crawlers/new/page.tsx

# 3. Sync changes
./scripts/dev-sync-manual.sh

# 4. Test on https://portal.spoot.com
# Changes appear in ~2 seconds

# 5. When done, switch back
./scripts/prod-mode.sh
```

### Example 2: Extended Development Session
```bash
# 1. Switch to dev mode
./scripts/dev-mode.sh

# 2. Start auto-sync in a separate terminal
./scripts/dev-sync.sh

# 3. Edit files as needed
# Changes sync automatically on save

# 4. When done, Ctrl+C the sync script
# 5. Switch back to production
./scripts/prod-mode.sh
```

### Example 3: Database Schema Change
```bash
# 1. Switch to dev mode
./scripts/dev-mode.sh

# 2. Edit schema
code prisma/schema.prisma

# 3. Sync and migrate
./scripts/dev-sync-manual.sh
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  'cd ~/clean-portal && docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev'

# 4. Test changes
# 5. Switch back to production
./scripts/prod-mode.sh
```

---

## 📊 Performance Comparison

| Task | Production Build | Dev Mode |
|------|-----------------|----------|
| UI change | 10-20 min | 2-5 sec |
| API route change | 10-20 min | 2-5 sec |
| Component change | 10-20 min | 2-5 sec |
| Config change | 10-20 min | 2-5 sec |
| Schema change | 10-20 min + migration | 2-5 sec + migration |

---

## 🔐 Security Notes

- Dev mode should only be used during active development
- Always switch back to production mode when done
- Dev mode runs with `NODE_ENV=development` (more verbose errors)
- Uses same authentication as production

---

## 💡 Tips

1. **Keep a terminal open with logs:**
   ```bash
   ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
     'cd ~/clean-portal && docker-compose -f docker-compose.dev.yml logs -f app'
   ```

2. **Use auto-sync for long sessions:**
   ```bash
   ./scripts/dev-sync.sh
   ```

3. **Commit before switching modes:**
   ```bash
   git add .
   git commit -m "WIP: testing changes"
   ```

4. **Check which mode is running:**
   ```bash
   ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
     'docker ps --format "table {{.Names}}\t{{.Status}}"'
   ```

---

## 🚨 When to Use Full Deploy

Use the full Docker build/deploy for:
- ✅ Production releases
- ✅ Dependency changes (package.json)
- ✅ Dockerfile changes
- ✅ Major refactors
- ✅ Before merging to main

Use dev mode for:
- ✅ UI tweaks
- ✅ Component changes
- ✅ API route changes
- ✅ Bug fixes
- ✅ Rapid iteration
