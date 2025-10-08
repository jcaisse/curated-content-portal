# Phase 3: Development Environment Implementation Plan

**Prepared:** October 6, 2025  
**Status:** Ready for Review & Approval

## 🎯 Objectives

1. Create isolated development environment on same EC2 instance
2. Maintain production stability while enabling safe testing
3. Enable "raise PR and push to production" workflow
4. Clear separation between dev and prod environments

## 🏗️ Proposed Architecture

### Environment Separation

| Aspect | Production | Development |
|--------|-----------|-------------|
| **URL** | https://portal.spoot.com | https://dev.portal.spoot.com |
| **Containers** | `*-prod` suffix | `*-dev` suffix |
| **Network** | `clean-portal-prod-network` | `clean-portal-dev-network` |
| **Database** | `clean-portal-db-prod` (port 5432) | `clean-portal-db-dev` (port 5433) |
| **App Port** | 3000 (internal) | 3001 (internal) |
| **Caddy Config** | Production SSL + domain | Dev SSL + subdomain |
| **NODE_ENV** | `production` | `development` |
| **Data** | Separate prod database | Separate dev database |
| **Deployment** | Pre-built Docker image | Hot-reload from files |

## 📁 Proposed Directory Structure

```
/home/ec2-user/
├── clean-portal/                    # Main codebase
│   ├── src/
│   ├── prisma/
│   ├── docker-compose.prod.yml      # Production orchestration
│   ├── docker-compose.dev.yml       # Development orchestration
│   ├── .env.prod                    # Production secrets
│   ├── .env.dev                     # Development secrets
│   ├── Caddyfile.prod              # Production Caddy config
│   └── Caddyfile.dev               # Development Caddy config
└── deployments/
    └── production/                  # Production deployment artifacts
```

## 🔄 Implementation Steps

### Step 1: Prepare Configuration Files (30 min)

1. Create `docker-compose.prod.yml` for production
   - Define all services with `-prod` suffix
   - Use production environment variables
   - No file mounts (use built image)
   
2. Create `docker-compose.dev.yml` for development
   - Define all services with `-dev` suffix
   - Use development environment variables
   - Include file mounts for hot-reload

3. Create separate Caddyfile configs
   - `Caddyfile.prod`: Serve portal.spoot.com
   - `Caddyfile.dev`: Serve dev.portal.spoot.com

4. Split environment variables
   - `.env.prod`: Production secrets
   - `.env.dev`: Development secrets (separate DB, different admin password)

### Step 2: Rename Current Containers to Production (15 min)

1. Stop current containers
2. Rename containers from `-dev` to `-prod` suffix
3. Update environment to `NODE_ENV=production`
4. Restart with new names
5. Verify production site still works

### Step 3: Setup DNS for Dev Subdomain (5 min)

1. Add A record: `dev.portal.spoot.com` → `44.198.212.206`
2. Wait for DNS propagation
3. Caddy will auto-obtain SSL certificate

### Step 4: Deploy Development Environment (30 min)

1. Copy current database to dev database (for testing data)
2. Deploy dev environment using `docker-compose.dev.yml`
3. Verify dev site accessible at https://dev.portal.spoot.com
4. Test hot-reload functionality

### Step 5: Document Workflow (15 min)

1. Create deployment workflow documentation
2. Document "raise PR and push to production" process
3. Create scripts for common operations

## 🔐 Security Considerations

### Production Environment
- Strong passwords (existing)
- Production OpenAI API key
- Strict configuration validation
- No debug mode

### Development Environment
- Separate admin credentials
- Development API keys (or same, user's choice)
- Relaxed validation
- Debug mode enabled
- Separate database (no risk to prod data)

## 🚀 Deployment Workflow ("Raise PR and Push to Production")

### Developer Flow:
1. Make changes in local IDE
2. Test locally if needed
3. When ready: "raise PR and push to dev"
   - Deploy changes to dev.portal.spoot.com
   - Test and verify on dev environment

### Production Deployment:
1. User reviews changes on dev site
2. User approves: "push to production"
   - Build production Docker image
   - Run database migrations (if any)
   - Deploy to production with zero downtime
   - Verify production deployment

## 📊 Resource Estimates

### Additional Resources Needed:
- **Disk Space:** ~5GB for dev database + containers
- **Memory:** ~2GB additional RAM for dev services  
- **CPU:** Minimal additional load
- **Ports:** 3001 (dev app), 5433 (dev db), 6381 (dev redis)

### Current EC2 Instance Check:
```bash
# Verify instance has sufficient resources
aws ec2 describe-instances --instance-ids i-05efc928b83a2e0ab \
  --query 'Reservations[0].Instances[0].[InstanceType,CpuOptions,BlockDeviceMappings]'
```

## ⚠️ Risk Mitigation

### Risks:
1. **DNS Propagation:** Dev site not immediately accessible
   - Mitigation: Can access via IP:port during propagation

2. **Resource Constraints:** EC2 instance may struggle with both environments
   - Mitigation: Monitor resources, can stop dev when not needed

3. **Config Conflicts:** Both Caddy instances might conflict
   - Mitigation: Single Caddy with multi-domain config

4. **Database Migration Conflicts:** Dev and prod schema drift
   - Mitigation: Always test migrations on dev first

### Rollback Plan:
- Keep current setup documented
- Can quickly revert to current state if issues arise
- Production environment remains untouched during dev setup

## 💰 Cost Impact

- **No additional cost:** Same EC2 instance
- Dev environment can be stopped when not in use
- Production remains 24/7 operational

## ✅ Success Criteria

- [ ] Production site remains stable and accessible
- [ ] Dev site accessible at dev.portal.spoot.com
- [ ] Both environments fully isolated (separate DBs)
- [ ] Hot-reload working in dev environment
- [ ] Can deploy from dev to prod with single command
- [ ] Clear documentation for deployment workflow

## 🔄 Alternative Approaches Considered

### Option A: Separate EC2 Instance (REJECTED)
- Pros: Complete isolation, no resource sharing
- Cons: Additional cost ($20-40/month), more complex management
- **Decision:** Same instance preferred to minimize costs

### Option B: Docker Compose with Profiles (CONSIDERED)
- Pros: Single docker-compose.yml file
- Cons: More complex configuration, harder to understand
- **Decision:** Separate files clearer for this use case

### Option C: Kubernetes (REJECTED)
- Pros: Professional-grade orchestration
- Cons: Massive overkill, complex setup, higher resource requirements
- **Decision:** Docker Compose sufficient for this scale

## 📝 Next Steps

**Pending User Approval:**

1. Do you approve this plan?
2. Should dev environment use same OpenAI API key or separate?
3. Do you want dev database pre-populated with production data copy?
4. Any modifications to the plan?

**Once Approved:**
- Estimated implementation time: 2-3 hours
- No expected downtime for production
- Dev environment ready for immediate use

---

**Questions or concerns?** Please review and provide feedback before proceeding.

