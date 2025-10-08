# Production Environment - Current Status

**Last Updated:** October 6, 2025  
**Status:** ✅ ONLINE and OPERATIONAL

## 🌐 Site Information

- **Production URL:** https://portal.spoot.com
- **SSL Certificate:** Valid (Let's Encrypt via Caddy)
- **Status:** HTTP 200 - All services operational

## 🔐 Admin Access

- **Login URL:** https://portal.spoot.com/auth/signin
- **Email:** admin@spoot.com
- **Password:** Sp00t!Sp00t!Sp00t!Sp00t!
- **Admin Panel:** https://portal.spoot.com/admin

## 🏗️ Infrastructure Overview

### EC2 Instance
- **IP Address:** 44.198.212.206
- **Instance ID:** i-05efc928b83a2e0ab
- **SSH Key:** clean-portal-deploy
- **Region:** us-east-1

### Docker Containers

| Container Name | Image | Status | Ports | Purpose |
|----------------|-------|--------|-------|---------|
| clean-portal-app-dev | node:20-alpine | Running | 3000:3000 | Next.js Application |
| clean-portal-caddy-dev | caddy:2-alpine | Running | 80:80, 443:443 | Reverse Proxy + SSL |
| clean-portal-db-dev | pgvector/pgvector:pg16 | Healthy | 5434:5432 | PostgreSQL Database |
| clean-portal-redis-dev | redis:7-alpine | Healthy | 6380:6379 | Cache/Session Store |

### Network Configuration
- **Network Name:** clean-portal-dev_portal-network-dev
- **Type:** Bridge network
- **All containers** connected to this network

### File Structure on EC2

```
/home/ec2-user/clean-portal/
├── src/              # Application source (mounted to container)
│   ├── app/         # Next.js app directory
│   ├── components/  # React components  
│   └── lib/         # Utilities and services
├── prisma/          # Database schema and migrations
├── public/          # Static files
├── package.json     # Dependencies
├── tsconfig.json    # TypeScript configuration
├── next.config.js   # Next.js configuration
└── Caddyfile        # Caddy reverse proxy config
```

## 🔧 Configuration

### Environment Variables

**Core Application:**
- `NODE_ENV=development` (Note: Running dev mode for hot-reload)
- `PORT=3000`
- `DOMAIN=portal.spoot.com`
- `EMAIL=noreply@spoot.com`

**Database:**
- `DATABASE_URL=postgresql://postgres:***@clean-portal-db-dev:5432/curated_content_portal`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=***` (43 characters)
- `POSTGRES_DB=curated_content_portal`
- `POSTGRES_PORT=5432`

**Authentication:**
- `NEXTAUTH_URL=http://portal.spoot.com`
- `NEXTAUTH_SECRET=***` (44 characters, base64)
- `ADMIN_EMAIL=admin@spoot.com`
- `ADMIN_PASSWORD=***` (24 characters)

**AI Features:**
- `OPENAI_API_KEY=sk-proj-***`
- `OPENAI_MODEL=gpt-4o-mini`

**Security:**
- `ADMIN_INGEST_KEY=***` (33 characters)

### Volume Mounts (Hot-Reload Setup)
- `/home/ec2-user/clean-portal/src` → `/app/src` (read-only)
- `/home/ec2-user/clean-portal/prisma` → `/app/prisma` (read-only)
- `/home/ec2-user/clean-portal/public` → `/app/public` (read-only)
- `/home/ec2-user/clean-portal/package.json` → `/app/package.json` (read-only)

## ✅ Verified Functionality

- [x] HTTPS access with valid SSL
- [x] Homepage loads correctly
- [x] Admin authentication working
- [x] Database connectivity (PostgreSQL with pgvector)
- [x] Redis caching operational
- [x] NextAuth session management
- [x] API endpoints responding
- [x] Caddy reverse proxy functioning
- [x] Configuration validation passing

## ⚠️ Current Limitations

1. **Naming Convention:** All containers use `-dev` suffix but serving production traffic
2. **NODE_ENV:** Set to `development` for hot-reload capability
3. **No Docker Compose:** Manually created containers (not orchestrated)
4. **Mixed Volumes:** Leftover volumes from previous setups exist
5. **No Dev Environment:** Currently no separate development environment

## 📊 Resource Usage

```bash
# Check container resource usage:
ssh -i ~/.ssh/clean-portal-deploy ubuntu@44.198.212.206 "docker stats --no-stream"

# Check disk usage:
ssh -i ~/.ssh/clean-portal-deploy ubuntu@44.198.212.206 "df -h"
```

## 🔍 Monitoring & Logs

### View Application Logs
```bash
aws ssm send-command --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker logs clean-portal-app-dev --tail 100"]'
```

### Check Container Health
```bash
aws ssm send-command --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker ps -a"]'
```

### Test Site Accessibility
```bash
curl -I https://portal.spoot.com/
curl https://portal.spoot.com/api/health
```

## 🚨 Emergency Procedures

### Restart Application Container
```bash
aws ssm send-command --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker restart clean-portal-app-dev"]'
```

### Restart All Services
```bash
aws ssm send-command --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker restart clean-portal-app-dev clean-portal-caddy-dev clean-portal-db-dev clean-portal-redis-dev"]'
```

### Check Database Connectivity
```bash
aws ssm send-command --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker exec clean-portal-db-dev psql -U postgres -d curated_content_portal -c \"SELECT COUNT(*) FROM \\\"User\\\"\""]'
```

## 📝 Notes

- Site was restored on October 6, 2025 after configuration issues
- All services are stable and operational
- Ready for Phase 3: Proper Dev/Prod environment separation
- Database contains admin user and all necessary tables
- SSL certificates auto-renew via Caddy

---

**Next Steps:** Implement Phase 3 - Separate Development Environment (see PHASE3_PLAN.md)

