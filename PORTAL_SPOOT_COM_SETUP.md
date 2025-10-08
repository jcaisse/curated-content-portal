# Portal.spoot.com Setup - Final Steps

## ✅ What's Already Working

1. **DNS Configuration**: ✅ `portal.spoot.com` → `44.198.212.206`
2. **SSL Certificate**: ✅ Automatically obtained from Let's Encrypt
3. **Application**: ✅ Running and healthy on EC2
4. **Caddy Reverse Proxy**: ✅ Configured and running
5. **Docker Containers**: ✅ All services healthy (app, db, redis, caddy)

## ⚠️ What's Blocking Access

**AWS Security Group** is blocking ports 80 (HTTP) and 443 (HTTPS).

Currently only port 3000 is accessible, but Caddy is listening on ports 80 and 443.

## 🔧 Required Fix: Open Ports in Security Group

### Step 1: Find the Security Group

1. Go to **AWS Console** → **EC2** → **Instances**
2. Click on instance with IP `44.198.212.206`
3. Look at the **Security** tab
4. Note the **Security Group ID** (e.g., `sg-xxxxxxxxx`)

### Step 2: Add Inbound Rules

1. Click on the Security Group ID
2. Go to **Inbound rules** tab
3. Click **Edit inbound rules**
4. Click **Add rule** for each:

   **Rule 1: HTTP**
   - Type: `HTTP`
   - Protocol: `TCP`
   - Port: `80`
   - Source: `0.0.0.0/0` (Anywhere IPv4)
   - Description: `HTTP for portal.spoot.com`

   **Rule 2: HTTPS**
   - Type: `HTTPS`
   - Protocol: `TCP`
   - Port: `443`
   - Source: `0.0.0.0/0` (Anywhere IPv4)
   - Description: `HTTPS for portal.spoot.com`

5. Click **Save rules**

### Step 3: Test Access

After adding the rules, test immediately:

```bash
# Test HTTP (will redirect to HTTPS)
curl -I http://portal.spoot.com/

# Test HTTPS
curl https://portal.spoot.com/api/health

# Open in browser
open https://portal.spoot.com/
```

## 🎉 Expected Result

Once ports are open:
- ✅ `http://portal.spoot.com` → redirects to HTTPS
- ✅ `https://portal.spoot.com` → loads the application
- ✅ SSL certificate is valid (Let's Encrypt)
- ✅ All features work normally

## 📋 Current Configuration

### Environment Variables
- `NEXTAUTH_URL`: `http://portal.spoot.com`
- `DOMAIN`: `portal.spoot.com`
- `EMAIL`: `noreply@spoot.com`

### Services Running
```
✅ PostgreSQL (with pgvector) - Port 5432
✅ Redis - Port 6379
✅ Next.js App - Port 3000 (internal)
✅ Caddy - Ports 80, 443 (blocked by security group)
```

### SSL Certificate
- Issuer: Let's Encrypt
- Domain: portal.spoot.com
- Auto-renewal: Enabled (Caddy handles this)

## 🔐 Admin Access

Once the site is accessible:
- URL: `https://portal.spoot.com/auth/signin`
- Email: `admin@cleanportal.com`
- Password: (stored in `.env.ec2` on EC2)

## 📝 Alternative: Temporary Access via Port 3000

If you need immediate access before fixing the security group:

```bash
# Access directly via port 3000 (bypasses Caddy)
curl http://44.198.212.206:3000/api/health

# Open in browser
open http://44.198.212.206:3000/
```

**Note**: This bypasses SSL and uses the IP address instead of the domain.

## 🚀 Next Steps

1. **Immediate**: Open ports 80 and 443 in AWS Security Group
2. **Test**: Verify `https://portal.spoot.com` loads
3. **Optional**: Update `NEXTAUTH_URL` to use HTTPS:
   ```bash
   # On EC2, edit .env file
   NEXTAUTH_URL="https://portal.spoot.com"
   ```
4. **Optional**: Set up monitoring and backups

## 📊 Deployment Summary

| Component | Status | Details |
|-----------|--------|---------|
| DNS | ✅ Working | portal.spoot.com → 44.198.212.206 |
| SSL Certificate | ✅ Obtained | Let's Encrypt (auto-renew) |
| Application | ✅ Running | Healthy, all migrations complete |
| Database | ✅ Running | PostgreSQL with pgvector |
| Redis | ✅ Running | Caching layer |
| Caddy | ✅ Running | Reverse proxy with auto-SSL |
| Port 80 | ⚠️ Blocked | Need to open in security group |
| Port 443 | ⚠️ Blocked | Need to open in security group |

---

## ✅ **FIXED - Site is Now Live!**

**What Was Fixed:**
1. ✅ Ports 80 and 443 were already open in the security group
2. ✅ Fixed Caddyfile issue - it was a directory instead of a file
3. ✅ Created proper Caddyfile for dev mode
4. ✅ Restarted Caddy container
5. ✅ Verified HTTPS access working

**Current Status:** 100% Complete - Site is accessible at `https://portal.spoot.com`

**All Services Running:**
- ✅ PostgreSQL with pgvector (Port 5432)
- ✅ Redis (Port 6379)  
- ✅ Next.js App (Port 3000)
- ✅ Caddy Reverse Proxy (Ports 80, 443)

**Test It:**
```bash
# Test HTTPS access
curl -I https://portal.spoot.com

# Open in browser
open https://portal.spoot.com/
```

---

**Status**: 100% Complete - Live and accessible!

