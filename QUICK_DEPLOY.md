# Quick Deployment Guide

## 🚀 Deploy to EC2 in 5 Steps

### Step 1: Generate Secrets
```bash
# Generate NEXTAUTH_SECRET
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"

# Generate ADMIN_INGEST_KEY
echo "ADMIN_INGEST_KEY=$(openssl rand -base64 32 | tr -d '=' | head -c 32)"

# Generate POSTGRES_PASSWORD
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '=')"
```

### Step 2: Create Environment File
```bash
# Copy template
cp env.ec2.example .env.ec2

# Edit file and fill in ALL secrets
# Use the secrets generated in Step 1
nano .env.ec2  # or use your preferred editor
```

**Required fields to fill:**
- `POSTGRES_PASSWORD` - from Step 1
- `DATABASE_URL` - update with your POSTGRES_PASSWORD
- `NEXTAUTH_URL` - set to your domain (e.g., `http://44.198.212.206:3000`)
- `NEXTAUTH_SECRET` - from Step 1
- `ADMIN_EMAIL` - your admin email
- `ADMIN_PASSWORD` - create a strong password (20+ chars)
- `ADMIN_INGEST_KEY` - from Step 1
- `OPENAI_API_KEY` - your OpenAI API key
- `DOMAIN` - your domain or IP (e.g., `44.198.212.206`)
- `EMAIL` - system email address

### Step 3: Run Deployment Script
```bash
./deploy-to-ec2.sh
```

This will:
1. ✅ Check prerequisites
2. 🔨 Build Docker image locally
3. ☁️  Push to AWS ECR
4. 📦 Copy files to EC2
5. 🚀 Deploy on EC2
6. ✓  Verify deployment

### Step 4: Verify Deployment
```bash
# Check health endpoint
curl http://44.198.212.206:3000/api/health

# View logs
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  "cd ~/clean-portal && docker-compose logs -f app"
```

### Step 5: Access Application
Open in browser: **http://44.198.212.206:3000**

Login with:
- Email: (value from `ADMIN_EMAIL` in `.env.ec2`)
- Password: (value from `ADMIN_PASSWORD` in `.env.ec2`)

---

## 🔧 Troubleshooting

### Build fails locally
```bash
# Check Docker is running
docker info

# Clear cache and rebuild
docker system prune -a
./deploy-to-ec2.sh
```

### Push to ECR fails
```bash
# Re-authenticate
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  284077920952.dkr.ecr.us-east-1.amazonaws.com

# Retry push
./deploy-to-ec2.sh --skip-build
```

### App won't start on EC2
```bash
# SSH to EC2
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206

# Check logs
cd ~/clean-portal
docker-compose logs app --tail=100

# Check if all environment variables are set
docker-compose config
```

### Database connection fails
```bash
# Verify DATABASE_URL in .env.ec2 matches POSTGRES_PASSWORD
# Ensure format: postgresql://postgres:PASSWORD@db:5432/curated_content_portal

# Restart services
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  "cd ~/clean-portal && docker-compose down && docker-compose up -d"
```

---

## 📚 Additional Resources

- **Full Documentation**: See `DEPLOYMENT_MASTER_PLAN.md`
- **Environment Variables**: See `env.ec2.example`
- **Docker Compose**: See `docker-compose.ec2.yml`

---

## ⚡ Quick Commands

### Redeploy (after code changes)
```bash
./deploy-to-ec2.sh
```

### Deploy without rebuilding
```bash
./deploy-to-ec2.sh --skip-build --skip-push
```

### View live logs
```bash
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  "cd ~/clean-portal && docker-compose logs -f"
```

### Restart application
```bash
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  "cd ~/clean-portal && docker-compose restart app"
```

### Clean up EC2 disk space
```bash
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206 \
  "docker system prune -a -f"
```


