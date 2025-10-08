# Manual Deployment Steps for EC2

The Docker image has been successfully built and pushed to ECR:
- **Image**: `284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:latest`
- **Digest**: `sha256:a677492c966fd2f1f207a72ae95d429e2cd75befe83801a7f38cfed2220a9831`

## Changes Deployed
- **Removed tab navigation** from the crawler edit page (`/admin/crawlers/[id]`)
- All sections now stacked vertically: Keywords, Sources, Moderation Queue, Portal Settings, Posts
- No functionality removed, only layout changed

## To Deploy on EC2 (Instance ID: i-05efc928b83a2e0ab, IP: 44.198.212.206)

SSH into the instance and run:

```bash
# Navigate to project directory
cd /home/ubuntu/clean-portal

# Pull latest code from GitHub
git pull origin main

# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 284077920952.dkr.ecr.us-east-1.amazonaws.com

# Pull the new image
docker compose pull

# Restart services with new image
docker compose down
docker compose up -d

# Check logs to verify deployment
docker compose logs --tail=50
```

## Verification

After deployment, visit:
- **Admin Crawlers**: http://portal.spoot.com/admin/crawlers
- **Edit a Crawler**: http://portal.spoot.com/admin/crawlers/[crawler-id]

You should see all sections (Keywords, Sources, Moderation Queue, Portal Settings, Posts) displayed vertically without tabs.

## Rollback (if needed)

If there are any issues, you can roll back by checking out the previous commit:

```bash
cd /home/ubuntu/clean-portal
git checkout 1a1616d  # Previous commit before tab removal
docker compose down
docker compose build --no-cache
docker compose up -d
```



