#!/bin/bash
# Bootstrap script to set up EC2 instance for deployment
# Run this on the EC2 instance to prepare it for GitHub Actions deployments

set -e

echo "🚀 Bootstrapping EC2 instance for Clean Portal deployment..."

# Install required packages
echo "📦 Installing required packages..."
sudo yum update -y
sudo yum install -y git docker

# Ensure Docker is running
echo "🐳 Starting Docker..."
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install docker-compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "📥 Installing docker-compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create working directory
echo "📁 Creating working directory..."
cd ~
mkdir -p clean-portal
cd clean-portal

# Clone repository (you'll need to provide GitHub token or use SSH)
echo "📥 Cloning repository..."
if [ ! -d ".git" ]; then
    # Using HTTPS - will need GitHub personal access token
    echo "Enter GitHub personal access token (or press Ctrl+C and set up SSH key):"
    read -s GITHUB_TOKEN
    git clone https://${GITHUB_TOKEN}@github.com/jcaisse/curated-content-portal.git .
else
    echo "Repository already cloned, pulling latest..."
    git pull origin main
fi

# Create production environment file
echo "📝 Creating production environment file..."
cat > docker-compose.prod.yml << 'EOF'
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
      - ./db/init:/docker-entrypoint-initdb.d
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

# Create .env file template
echo "📝 Creating .env template..."
cat > .env << 'EOF'
# Database Configuration
POSTGRES_DB=curated_content
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGEME_SECURE_PASSWORD_HERE

# Database URL
DATABASE_URL=postgresql://postgres:CHANGEME_SECURE_PASSWORD_HERE@db:5432/curated_content

# NextAuth Configuration
NEXTAUTH_URL=http://44.198.212.206:3000
NEXTAUTH_SECRET=CHANGEME_GENERATE_WITH_openssl_rand_base64_32
AUTH_SECRET=CHANGEME_GENERATE_WITH_openssl_rand_base64_32

# OpenAI
OPENAI_API_KEY=CHANGEME_YOUR_OPENAI_KEY

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=CHANGEME_SECURE_PASSWORD
EOF

echo ""
echo "⚠️  IMPORTANT: Edit the .env file with your actual secrets!"
echo "   vim ~/clean-portal/.env"
echo ""
echo "Generate secrets with:"
echo "   openssl rand -base64 32"
echo ""

# Set up AWS ECR authentication
echo "🔐 Configuring AWS ECR access..."
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 284077920952.dkr.ecr.us-east-1.amazonaws.com

echo ""
echo "✅ EC2 bootstrap complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your secrets: vim ~/clean-portal/.env"
echo "2. Pull the latest image: docker-compose -f docker-compose.prod.yml pull"
echo "3. Start the application: docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "After initial setup, GitHub Actions will handle deployments automatically!"


