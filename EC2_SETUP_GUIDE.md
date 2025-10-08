# EC2 Setup Guide - Initial Deployment

## Quick Setup (Copy/Paste These Commands)

SSH into your EC2 instance first:
```bash
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206
```

Then run these commands on the EC2 instance:

### Step 1: Install Docker and Git
```bash
sudo yum update -y
sudo yum install -y git docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user
```

**Important: After this, logout and login again for docker group to take effect:**
```bash
exit
ssh -i ~/.ssh/clean-portal-deploy ec2-user@44.198.212.206
```

### Step 2: Install docker-compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### Step 3: Create working directory and docker-compose file
```bash
mkdir -p ~/clean-portal
cd ~/clean-portal

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-curated_content}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    image: 284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal:latest
    depends_on:
      db:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - AUTH_SECRET=${AUTH_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  postgres_data:
EOF
```

### Step 4: Create .env file
```bash
# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
AUTH_SECRET=$(openssl rand -base64 32)

# Create .env file
cat > .env << EOF
POSTGRES_DB=curated_content
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${DB_PASSWORD}
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/curated_content
NEXTAUTH_URL=http://44.198.212.206:3000
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
AUTH_SECRET=${AUTH_SECRET}
OPENAI_API_KEY=YOUR_OPENAI_KEY_HERE
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
EOF

echo "✅ .env file created with generated secrets"
```

**IMPORTANT:** Edit the .env file to add your actual OpenAI API key:
```bash
nano .env
# or
vim .env
```
YOUR_OPENAI_API_KEY_HERE


Change these values:
- `OPENAI_API_KEY=YOUR_OPENAI_KEY_HERE` → your actual key
- `ADMIN_PASSWORD=ChangeMe123!` → a secure password

### Step 5: Configure AWS ECR Access
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 284077920952.dkr.ecr.us-east-1.amazonaws.com
```

### Step 6: Pull and Start
```bash
docker-compose pull app
docker-compose up -d
```

### Step 7: Verify
```bash
docker-compose ps
docker-compose logs app | tail -20
curl http://localhost:3000/api/health
```

## After Initial Setup

Once this is done, GitHub Actions will automatically deploy new versions when you push to main!

The workflow will:
1. Build new Docker image
2. Push to ECR
3. SSH to EC2
4. Pull latest image
5. Restart containers

## Troubleshooting

### Check logs
```bash
docker-compose logs -f app
docker-compose logs -f db
```

### Restart services
```bash
docker-compose restart
```

### Check if app is accessible
```bash
curl http://localhost:3000
```


