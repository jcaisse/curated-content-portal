# 🚀 Deployment Strategy - Dev vs Production

## 📍 **URLs**

### **Development (Dev Mode)**
- **URL:** https://portal.spoot.com
- **Mode:** Next.js development server with hot reload
- **Purpose:** Rapid iteration, testing, debugging
- **Performance:** Slower (unoptimized, verbose logging)
- **Updates:** 2-5 seconds via file sync

### **Production (Prod Mode)**
- **URL:** https://portal.spoot.com (same domain!)
- **Mode:** Optimized Docker container from ECR
- **Purpose:** Live traffic, releases, stable builds
- **Performance:** Fast (optimized build, minified)
- **Updates:** Full Docker build + deploy (~10-15 min)

**Note:** Both modes use the **same URL** but run different containers on EC2.

---

## 🎯 **Deployment Rules**

### **Default: Always Push to Dev**
Unless explicitly told "push to production", all changes go to **dev mode**.

```bash
# When you make changes:
./scripts/dev-sync-manual.sh   # ← Default action
```

### **Production: Only When Requested**
When I say **"push to production"** or **"deploy to prod"**, then:

1. Build Docker image
2. Push to ECR
3. Deploy to EC2 production mode

```bash
# Full production deployment:
docker buildx build --platform linux/amd64 -t cleanportal-app:latest -f Dockerfile . --load
docker tag cleanportal-app:latest 284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:latest
docker push 284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:latest
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  'cd ~/clean-portal && docker-compose pull && docker-compose up -d'
```

---

## 🔄 **Current Mode Detection**

To check which mode is currently running:

```bash
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  'docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"'
```

**Dev mode containers:**
- `clean-portal-app-dev` (node:20-alpine)
- `clean-portal-db-dev`
- `clean-portal-redis-dev`
- `clean-portal-caddy-dev`

**Production mode containers:**
- `clean-portal-app` (ECR image)
- `clean-portal-db`
- `clean-portal-redis`
- `clean-portal-caddy`

---

## 📊 **Mode Comparison**

| Feature | Dev Mode | Production Mode |
|---------|----------|-----------------|
| **URL** | https://portal.spoot.com | https://portal.spoot.com |
| **Container** | `node:20-alpine` | ECR Docker image |
| **Next.js** | `npm run dev` | `npm run start` (optimized) |
| **Hot Reload** | ✅ Yes | ❌ No |
| **Update Speed** | 2-5 seconds | 10-15 minutes |
| **Performance** | Slower (dev mode) | Fast (production build) |
| **Logging** | Verbose | Minimal |
| **Source Maps** | ✅ Yes | ❌ No |
| **Minification** | ❌ No | ✅ Yes |
| **Database** | Port 5434 | Port 5432 |
| **Redis** | Port 6380 | Port 6379 |
| **Use For** | Development, testing | Live traffic, releases |

---

## 🎨 **Typical Workflow**

### **Daily Development (Dev Mode)**

```bash
# 1. Make sure dev mode is running
./scripts/dev-mode.sh

# 2. Edit code locally
code src/app/admin/crawlers/new/page.tsx

# 3. Sync changes (automatic with dev-sync.sh or manual)
./scripts/dev-sync-manual.sh

# 4. Test on https://portal.spoot.com
# Changes appear in 2-5 seconds

# 5. Repeat steps 2-4 as needed
```

### **Production Release (Prod Mode)**

```bash
# 1. Ensure all changes are committed
git add .
git commit -m "Feature: XYZ"
git push origin main

# 2. User says: "push to production"

# 3. Build and deploy to production
# (Full Docker build + ECR push + EC2 deploy)

# 4. Switch EC2 to production mode
./scripts/prod-mode.sh

# 5. Verify on https://portal.spoot.com
```

---

## ⚠️ **Important Notes**

1. **Same URL for Both Modes**
   - Both dev and prod use `https://portal.spoot.com`
   - Only one mode can run at a time
   - Switching modes stops the other

2. **Data Persistence**
   - Dev mode uses separate volumes (`db-data-dev`, `redis_data_dev`)
   - Production uses separate volumes (`postgres_data`, `redis_data`)
   - **Data is NOT shared between modes**

3. **When to Use Each Mode**

   **Use Dev Mode When:**
   - ✅ Making UI changes
   - ✅ Fixing bugs
   - ✅ Testing new features
   - ✅ Rapid iteration needed
   - ✅ Debugging issues

   **Use Production Mode When:**
   - ✅ Releasing to users
   - ✅ Testing production performance
   - ✅ Before major announcements
   - ✅ When stability is critical
   - ✅ User explicitly requests it

4. **Default Assumption**
   - **Always assume dev mode** unless explicitly told "production"
   - Faster feedback loop
   - Safer for experimentation

---

## 🔐 **Environment Variables**

Both modes use the **same `.env` file** on EC2:
- `/home/ec2-user/clean-portal/.env`

Key differences:
- Dev mode: `NODE_ENV=development`
- Prod mode: `NODE_ENV=production`

---

## 🚨 **Emergency: Rollback to Production**

If dev mode breaks something:

```bash
# Quickly switch back to last known good production build
./scripts/prod-mode.sh
```

This restarts the production Docker image (last deployed version).

---

## 📝 **Quick Reference**

```bash
# Check current mode
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 'docker ps | grep -E "app|dev"'

# Switch to dev mode
./scripts/dev-mode.sh

# Switch to production mode
./scripts/prod-mode.sh

# Sync changes to dev
./scripts/dev-sync-manual.sh

# Auto-sync to dev (watch mode)
./scripts/dev-sync.sh

# Full production deploy
# (Only when user says "push to production")
docker buildx build --platform linux/amd64 -t cleanportal-app:latest -f Dockerfile . --load
docker tag cleanportal-app:latest 284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:latest
docker push 284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:latest
./scripts/prod-mode.sh
```

---

## ✅ **Current Status**

**Active Mode:** Dev Mode  
**URL:** https://portal.spoot.com  
**Container:** `clean-portal-app-dev` (node:20-alpine)  
**Ready for:** Rapid development and testing  

---

**Remember:** 
- 🔧 **Default = Dev Mode** (fast, iterative)
- 🏭 **Production = Only when requested** (stable, optimized)
- 🌐 **Same URL for both** (https://portal.spoot.com)
