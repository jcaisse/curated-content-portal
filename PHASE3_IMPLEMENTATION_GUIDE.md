# Phase 3 Implementation Guide
**Ready-to-Execute Instructions**

## ✅ Current Status
- Production is STABLE and ONLINE at https://portal.spoot.com
- All configuration files are prepared in this repository
- Ready for Phase 3 implementation when you're ready

## 📋 Pre-Implementation Checklist

Before starting:
- [ ] Confirm production site is stable
- [ ] Verify you have AWS CLI access
- [ ] Confirm DNS access for adding dev.portal.spoot.com
- [ ] Schedule a maintenance window (2-3 hours, minimal downtime)
- [ ] Backup production database (instructions below)

## 🚀 Implementation Steps

### Step 1: Setup DNS for Development Subdomain (5 minutes)

Add an A record in your DNS provider:
```
Type: A
Name: dev
Value: 44.198.212.206
TTL: 300 (5 minutes)
```

Test DNS propagation:
```bash
dig dev.portal.spoot.com
nslookup dev.portal.spoot.com
```

### Step 2: Backup Production Database (10 minutes)

```bash
# Create backup
aws ssm send-command \
  --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "docker exec clean-portal-db-dev pg_dump -U postgres curated_content_portal > /tmp/prod_backup_$(date +%Y%m%d_%H%M%S).sql",
    "ls -lh /tmp/prod_backup_*.sql | tail -1"
  ]'

# Verify backup was created
aws ssm get-command-invocation --command-id <COMMAND_ID_FROM_ABOVE> --instance-id i-05efc928b83a2e0ab
```

### Step 3: Upload Configuration Files to EC2 (10 minutes)

The following files are ready in your repository:
- `docker-compose.unified.yml` - Main orchestration file
- `Caddyfile.unified` - Caddy configuration for both domains

Upload to EC2:
```bash
# Using AWS SSM (since SSH isn't working)
cd "/Users/jcaisse/Cursor/clean portal"

# Copy docker-compose file
aws ssm send-command \
  --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters commands='["sudo -u ec2-user tee /home/ec2-user/clean-portal/docker-compose.yml > /dev/null << '\''EOF'\''
$(cat docker-compose.unified.yml)
EOF
"]'

# Copy Caddyfile
aws ssm send-command \
  --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters commands='["sudo -u ec2-user tee /home/ec2-user/clean-portal/Caddyfile > /dev/null << '\''EOF'\''
$(cat Caddyfile.unified)
EOF
"]'
```

### Step 4: Create Environment File on EC2 (5 minutes)

```bash
aws ssm send-command \
  --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "cat > /home/ec2-user/clean-portal/.env << '\''EOF'\''
POSTGRES_PASSWORD_PROD=gZ0ht3HNE9ExHJ6MHbYqthHRbe9mOBTe9oH6DfzTxFA
POSTGRES_PASSWORD_DEV=gZ0ht3HNE9ExHJ6MHbYqthHRbe9mOBTe9oH6DfzTxFA
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE
ADMIN_EMAIL=admin@spoot.com
ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD_HERE
ADMIN_INGEST_KEY=YOUR_INGEST_KEY_HERE
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
EOF",
    "chmod 600 /home/ec2-user/clean-portal/.env",
    "chown ec2-user:ec2-user /home/ec2-user/clean-portal/.env"
  ]'
```

### Step 5: Stop Current Containers (2 minutes)

```bash
aws ssm send-command \
  --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo Stopping current containers...",
    "docker stop clean-portal-app-dev clean-portal-caddy-dev",
    "docker ps"
  ]'
```

**Note:** Database and Redis can stay running - we'll rename them in the next step.

### Step 6: Copy Production Database to Dev (15 minutes)

```bash
aws ssm send-command \
  --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo Creating development database...",
    "docker exec clean-portal-db-dev psql -U postgres -c '\''CREATE DATABASE curated_content_portal_dev'\''",
    "echo Copying production data to development...",
    "docker exec clean-portal-db-dev pg_dump -U postgres curated_content_portal | docker exec -i clean-portal-db-dev psql -U postgres curated_content_portal_dev",
    "echo Verifying dev database...",
    "docker exec clean-portal-db-dev psql -U postgres -d curated_content_portal_dev -c '\''SELECT COUNT(*) FROM \"User\"'\''"
  ]'
```

### Step 7: Launch New Environment with Docker Compose (20 minutes)

```bash
aws ssm send-command \
  --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "cd /home/ec2-user/clean-portal",
    "echo Installing docker-compose if needed...",
    "which docker-compose || curl -L https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose",
    "echo Stopping old containers...",
    "docker stop clean-portal-app-dev clean-portal-caddy-dev clean-portal-db-dev clean-portal-redis-dev || true",
    "docker rm clean-portal-app-dev clean-portal-caddy-dev || true",
    "echo Starting new environment...",
    "docker-compose up -d",
    "echo Waiting for services to start...",
    "sleep 30",
    "docker-compose ps"
  ]'
```

### Step 8: Verify Both Environments (10 minutes)

Test production:
```bash
curl -I https://portal.spoot.com/
curl https://portal.spoot.com/api/health
```

Test development:
```bash
curl -I https://dev.portal.spoot.com/
curl https://dev.portal.spoot.com/api/health
```

Test in browser:
- Production: https://portal.spoot.com
- Development: https://dev.portal.spoot.com

### Step 9: Cleanup Old Containers (5 minutes)

```bash
# Remove old network if it exists
aws ssm send-command \
  --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "docker network rm clean-portal-dev_portal-network-dev || true",
    "echo Cleanup complete"
  ]'
```

## 🔍 Troubleshooting

### If Production Site Goes Down:

**Quick Rollback:**
```bash
aws ssm send-command \
  --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "cd /home/ec2-user/clean-portal",
    "docker-compose down",
    "docker start clean-portal-db-dev clean-portal-redis-dev",
    "docker run -d --name clean-portal-app-dev --network clean-portal-dev_portal-network-dev --link clean-portal-db-dev:db --link clean-portal-redis-dev:redis -p 3000:3000 -e DATABASE_URL=\"postgresql://postgres:gZ0ht3HNE9ExHJ6MHbYqthHRbe9mOBTe9oH6DfzTxFA@clean-portal-db-dev:5432/curated_content_portal?schema=public\" -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE -e POSTGRES_DB=curated_content_portal -e POSTGRES_PORT=5432 -e NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE -e NEXTAUTH_URL=http://portal.spoot.com -e ADMIN_EMAIL=admin@spoot.com -e ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD_HERE -e ADMIN_INGEST_KEY=YOUR_INGEST_KEY_HERE -e OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE -e OPENAI_MODEL=gpt-4o-mini -e DOMAIN=portal.spoot.com -e EMAIL=noreply@spoot.com -e NODE_ENV=development -e PORT=3000 -v /home/ec2-user/clean-portal/src:/app/src:ro -v /home/ec2-user/clean-portal/package.json:/app/package.json:ro -v /home/ec2-user/clean-portal/prisma:/app/prisma:ro -v /home/ec2-user/clean-portal/public:/app/public:ro -w /app node:20-alpine sh -c \"apk add --no-cache openssl && cd /app && npm install && npm run dev\"",
    "docker start clean-portal-caddy-dev"
  ]'
```

### Check Logs:

```bash
# Production app logs
aws ssm send-command \
  --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker logs clean-portal-app-prod --tail 50"]'

# Development app logs
aws ssm send-command \
  --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker logs clean-portal-app-dev --tail 50"]'

# Caddy logs
aws ssm send-command \
  --instance-ids i-05efc928b83a2e0ab \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker logs clean-portal-caddy --tail 50"]'
```

## 📊 Post-Implementation Verification

- [ ] Production site accessible at https://portal.spoot.com
- [ ] Can log in to production admin panel
- [ ] Development site accessible at https://dev.portal.spoot.com  
- [ ] Can log in to development admin panel
- [ ] Both sites have separate databases
- [ ] SSL certificates obtained for both domains
- [ ] No errors in container logs

## 📝 Next Steps After Implementation

1. Test deploying a change to dev environment
2. Document the "push to production" workflow
3. Set up automated backups
4. Consider adding monitoring/alerting

---

**Status:** Ready to execute when you're ready. All files prepared.  
**Estimated Time:** 2-3 hours  
**Risk Level:** Low (rollback procedure documented)


