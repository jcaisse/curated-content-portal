# 🚀 Hot Reload Dev Mode - Setup Complete!

## ✅ What's Done

Your EC2 instance now has **two modes**:

### 🔧 **Dev Mode** (Current)
- Next.js runs in development mode with hot reload
- Changes sync from local → EC2 in **2-5 seconds**
- No Docker image rebuilds needed
- Perfect for rapid iteration

### 🏭 **Production Mode**
- Uses pre-built Docker images from ECR
- Optimized for performance
- Use for releases and production traffic

---

## 📊 Storage Strategy Confirmed

**Media Storage:** `FILE_STORAGE_STRATEGY=url_only`

✅ **No local media storage** - images remain on original sources  
✅ **Only URLs stored** in database (`Post.imageUrl` field)  
✅ **8GB disk is sufficient** with regular cleanup  
✅ **No S3 needed** for current setup  

**Disk Usage:**
- Docker images: ~2-3GB
- PostgreSQL data: ~100-500MB
- Redis: ~10-50MB
- Node modules (dev): ~500MB-1GB
- **Total: 5-6GB** (plenty of headroom)

---

## 🎯 Quick Start Guide

### Make a Code Change (Fast Way)

```bash
# 1. Edit code locally in VS Code/Cursor
code src/app/admin/crawlers/new/page.tsx

# 2. Save the file

# 3. Sync to EC2
./scripts/dev-sync-manual.sh

# 4. Changes appear on https://portal.spoot.com in ~2-5 seconds!
```

### Switch Between Modes

```bash
# Switch to dev mode (for rapid development)
./scripts/dev-mode.sh

# Switch to production mode (for releases)
./scripts/prod-mode.sh
```

### Auto-Sync (Optional)

```bash
# Install fswatch (one-time)
brew install fswatch

# Start auto-sync (watches for file changes)
./scripts/dev-sync.sh

# Now every time you save a file, it syncs automatically!
```

---

## 📁 What Gets Synced

**Synced (hot reload):**
- ✅ `src/` - all app code
- ✅ `public/` - static assets
- ✅ `prisma/` - database schema
- ✅ `*.config.js/ts` - config files

**Not synced (built on EC2):**
- ❌ `node_modules/` - installed on EC2
- ❌ `.next/` - built on EC2
- ❌ `.git/` - not needed

---

## 🔧 Troubleshooting

### Changes not appearing?

```bash
# Check if dev mode is running
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 'docker ps | grep dev'

# Check app logs
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  'docker logs clean-portal-app-dev --tail=50'

# Restart dev mode
./scripts/dev-mode.sh
```

### Out of disk space?

```bash
# Clean up old Docker images
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  'docker system prune -af && docker builder prune -af'

# Check disk usage
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 'df -h'
```

### Need to install new dependencies?

```bash
# 1. Add to package.json locally
# 2. Sync files
./scripts/dev-sync-manual.sh

# 3. Restart dev container (will run npm install)
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  'cd ~/clean-portal && docker-compose -f docker-compose.dev.yml restart app'
```

---

## ⚡ Performance Comparison

| Task | Old Way (Docker Build) | New Way (Dev Mode) |
|------|------------------------|---------------------|
| UI change | 10-20 min | **2-5 sec** ⚡ |
| API route change | 10-20 min | **2-5 sec** ⚡ |
| Component change | 10-20 min | **2-5 sec** ⚡ |
| Config change | 10-20 min | **2-5 sec** ⚡ |

**~200x faster!** 🚀

---

## 🚨 When to Use Full Deploy

Use the full Docker build/deploy for:
- ✅ Production releases
- ✅ Dependency changes (package.json)
- ✅ Dockerfile changes
- ✅ Before merging to main
- ✅ Major refactors

Use dev mode for:
- ✅ UI tweaks (like the button fix we just did)
- ✅ Component changes
- ✅ API route changes
- ✅ Bug fixes
- ✅ Rapid iteration

---

## 📝 Example Workflow

### Scenario: Fix a UI Bug

**Before (slow):**
1. Edit code locally
2. `docker build` (5-10 min)
3. `docker push` to ECR (2-5 min)
4. SSH to EC2, pull, restart (2-3 min)
5. **Total: 10-20 minutes** 😫

**After (fast):**
1. Edit code locally
2. `./scripts/dev-sync-manual.sh` (2-5 sec)
3. **Total: 2-5 seconds** 🚀

### Scenario: Add a New Feature

**Development:**
1. Switch to dev mode: `./scripts/dev-mode.sh`
2. Start auto-sync: `./scripts/dev-sync.sh`
3. Code, save, test (instant feedback loop)
4. Iterate rapidly

**Deployment:**
1. Commit changes: `git add . && git commit -m "New feature"`
2. Switch to prod mode: `./scripts/prod-mode.sh`
3. Build and deploy: (GitHub Actions or manual)
4. Verify on production

---

## 🎉 Current Status

✅ Dev mode is **RUNNING** on EC2  
✅ App accessible at **https://portal.spoot.com**  
✅ Hot reload is **WORKING**  
✅ Sync scripts are **READY**  
✅ 8GB disk is **SUFFICIENT** (no media storage needed)  

**You're all set!** 🚀

---

## 💡 Pro Tips

1. **Keep a terminal with logs open:**
   ```bash
   ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
     'docker logs -f clean-portal-app-dev'
   ```

2. **Use auto-sync for long sessions:**
   ```bash
   ./scripts/dev-sync.sh
   # Leave it running in a separate terminal
   ```

3. **Check which mode is running:**
   ```bash
   ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
     'docker ps --format "table {{.Names}}\t{{.Status}}"'
   ```

4. **Switch back to prod before leaving:**
   ```bash
   ./scripts/prod-mode.sh
   ```

---

## 📚 Related Files

- `DEV_MODE_GUIDE.md` - Detailed guide with all commands
- `scripts/dev-mode.sh` - Switch to dev mode
- `scripts/prod-mode.sh` - Switch to production mode
- `scripts/dev-sync-manual.sh` - Manual one-time sync
- `scripts/dev-sync.sh` - Auto-sync (watch mode)
- `docker-compose.dev.yml` (on EC2) - Dev mode configuration
- `docker-compose.yml` (on EC2) - Production configuration

---

**Happy coding! 🎨**
