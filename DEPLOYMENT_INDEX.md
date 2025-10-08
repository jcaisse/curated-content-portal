# 🚀 Clean Portal Deployment - Start Here

## Quick Start (5 Minutes to Deploy)

### 1️⃣ Generate Secrets
```bash
./generate-secrets.sh
```
This will create all required secrets and save them to a temporary file.

### 2️⃣ Configure Environment
```bash
# Copy template
cp env.ec2.example .env.ec2

# Copy secrets from generate-secrets.sh output into .env.ec2
# Fill in remaining fields:
#   - NEXTAUTH_URL
#   - ADMIN_EMAIL
#   - OPENAI_API_KEY
#   - DOMAIN
#   - EMAIL
```

### 3️⃣ Deploy
```bash
./deploy-to-ec2.sh
```

### 4️⃣ Verify
```bash
curl http://44.198.212.206:3000/api/health
```

### 5️⃣ Access
Open: **http://44.198.212.206:3000**

---

## 📚 Documentation Index

### Essential Reading (Start Here)
1. **QUICK_DEPLOY.md** - 5-step deployment guide
2. **DEVOPS_REVIEW_SUMMARY.md** - Complete overview of deployment strategy

### Deep Dive (When You Need Details)
3. **DEPLOYMENT_MASTER_PLAN.md** - Comprehensive deployment documentation
   - Complete environment variable list
   - AWS infrastructure requirements
   - Troubleshooting checklist
   - Manual deployment steps

### Reference Files
4. **env.ec2.example** - Environment variable template
5. **docker-compose.ec2.yml** - Production Docker Compose configuration

---

## 🛠️ Scripts & Tools

### Core Scripts
- **`generate-secrets.sh`** - Generate all required secrets automatically
- **`deploy-to-ec2.sh`** - Complete automated deployment
  - `./deploy-to-ec2.sh --skip-build` - Skip Docker build
  - `./deploy-to-ec2.sh --skip-push` - Skip ECR push

### Existing Scripts (Reference)
- **`ops/deploy.sh`** - Local development deployment
- **`.github/workflows/deploy.yml`** - GitHub Actions CI/CD

---

## 🔑 Required Secrets Checklist

Before deploying, ensure you have:

### Critical Secrets (Auto-Generated)
- [ ] `NEXTAUTH_SECRET` - (from generate-secrets.sh)
- [ ] `ADMIN_INGEST_KEY` - (from generate-secrets.sh)
- [ ] `POSTGRES_PASSWORD` - (from generate-secrets.sh)
- [ ] `ADMIN_PASSWORD` - (from generate-secrets.sh)
- [ ] `DATABASE_URL` - (updated with POSTGRES_PASSWORD)

### User-Provided Values
- [ ] `NEXTAUTH_URL` - Your public URL (e.g., http://44.198.212.206:3000)
- [ ] `ADMIN_EMAIL` - Your admin email address
- [ ] `OPENAI_API_KEY` - Your OpenAI API key
- [ ] `DOMAIN` - Your domain or IP (e.g., 44.198.212.206)
- [ ] `EMAIL` - System email address

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] Docker Desktop is running
- [ ] AWS CLI is configured
- [ ] SSH key exists at `~/.ssh/clean-portal-deploy`
- [ ] Can SSH to EC2: `ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206`

### Configuration
- [ ] Generated secrets with `./generate-secrets.sh`
- [ ] Created `.env.ec2` from `env.ec2.example`
- [ ] Filled in all required values in `.env.ec2`
- [ ] Verified no placeholder values remain (e.g., `YOUR_SECRET_HERE`)

### Deployment
- [ ] Run `./deploy-to-ec2.sh`
- [ ] All steps complete successfully
- [ ] Health check passes: `curl http://44.198.212.206:3000/api/health`
- [ ] Can access application in browser
- [ ] Can login to admin panel

### Post-Deployment
- [ ] Delete temporary secrets file: `rm secrets-*.txt`
- [ ] Verify all features work
- [ ] Test GitHub Actions workflow (optional)

---

## 🆘 Common Issues & Solutions

### "Docker is not running"
```bash
# Start Docker Desktop, then retry
./deploy-to-ec2.sh
```

### "Cannot connect to EC2"
```bash
# Verify SSH key and connectivity
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 "echo connected"
```

### "Environment file not found"
```bash
# Create from template
cp env.ec2.example .env.ec2
# Then fill in all values
```

### "App keeps restarting"
```bash
# Check logs
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  "cd ~/clean-portal && docker-compose logs app --tail=100"
  
# Usually means missing environment variable
# Verify .env.ec2 has ALL required fields
```

### "ECR push fails"
```bash
# Re-authenticate
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  284077920952.dkr.ecr.us-east-1.amazonaws.com

# Retry
./deploy-to-ec2.sh --skip-build
```

---

## 📊 Deployment Architecture

```
┌─────────────────┐
│  Local Machine  │
│                 │
│  1. Build       │────┐
│  2. Push        │    │
└─────────────────┘    │
                       │
                       ▼
              ┌─────────────────┐
              │   AWS ECR       │
              │                 │
              │  Docker Image   │
              │  Registry       │
              └─────────────────┘
                       │
                       │ Pull
                       ▼
              ┌─────────────────┐
              │   EC2 Instance  │
              │                 │
              │  ┌───────────┐  │
              │  │ Postgres  │  │
              │  └───────────┘  │
              │  ┌───────────┐  │
              │  │   App     │  │
              │  └───────────┘  │
              │  ┌───────────┐  │
              │  │  Redis    │  │
              │  └───────────┘  │
              └─────────────────┘
                       │
                       │
                       ▼
                ┌─────────────┐
                │   Users     │
                │             │
                │  Browser    │
                └─────────────┘
```

---

## 🔄 Continuous Deployment (GitHub Actions)

After successful manual deployment, GitHub Actions will handle automated deployments:

1. Push code to `main` branch
2. GitHub Actions triggers automatically
3. Runs linting and tests
4. Builds Docker image
5. Pushes to ECR
6. Deploys to EC2 via SSH
7. Verifies health check

**Status**: ⚠️ Ready to use after first manual deployment succeeds

---

## 📝 Files You Need to Create

1. **`.env.ec2`** - Production environment variables (copy from `env.ec2.example`)
   - ⚠️ Required before deployment
   - ⚠️ Never commit to git
   - ⚠️ Contains all secrets

That's it! Everything else is provided.

---

## 🎓 Learning Path

### If You're New to This Project
1. Read `QUICK_DEPLOY.md` (5 minutes)
2. Run `./generate-secrets.sh`
3. Create `.env.ec2`
4. Run `./deploy-to-ec2.sh`
5. Success! 🎉

### If You Want to Understand Everything
1. Read `DEVOPS_REVIEW_SUMMARY.md` (15 minutes)
2. Read `DEPLOYMENT_MASTER_PLAN.md` (30 minutes)
3. Review `docker-compose.ec2.yml` and `env.ec2.example`
4. Study `deploy-to-ec2.sh` script

---

## 🚨 Critical Warnings

### Never Commit These Files
- `.env.ec2` (contains secrets)
- `secrets-*.txt` (temporary secrets file)
- Any file with actual passwords or API keys

### Before Running Production
- [ ] Generated strong secrets (not defaults)
- [ ] Changed ADMIN_PASSWORD from generated one
- [ ] Verified OPENAI_API_KEY is valid
- [ ] Set proper NEXTAUTH_URL for your domain

---

## 📞 Support & Resources

### Getting Help
1. Check documentation in this directory
2. Review logs: `ssh ... "docker-compose logs -f app"`
3. Check GitHub Actions workflow logs

### Key Resources
- AWS Account: `284077920952`
- ECR Repository: `clean-portal`
- Region: `us-east-1`
- EC2 Host: `44.198.212.206`

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ `./deploy-to-ec2.sh` completes without errors
- ✅ Health check returns successful response
- ✅ Can access app at http://44.198.212.206:3000
- ✅ Can login to admin panel
- ✅ Can create crawlers and manage content

---

**Ready to Deploy?** Start with `./generate-secrets.sh` → `QUICK_DEPLOY.md` → `./deploy-to-ec2.sh`


