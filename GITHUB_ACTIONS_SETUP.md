# GitHub Actions Deployment Setup Guide

## Current Status

✅ **AWS Infrastructure Verified:**
- AWS Account: `284077920952`
- AWS User: `ai-portal-developer`
- ECR Repository: `clean-portal` (exists at `284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal`)
- EC2 Instance: `i-05efc928b83a2e0ab` (running at `44.198.212.206`)
- EC2 Instance Name: `clean-portal-ec2`
- EC2 Key Pair: `clean-portal-deploy`

❌ **Missing Configuration:**
- GitHub Secrets (8 required secrets not set)
- EC2 SSH Key (key pair "clean-portal-deploy" not found locally)

## Step 1: Locate or Create EC2 SSH Key

The EC2 instance uses key pair: `clean-portal-deploy`

### Option A: Find Existing Key

If you previously downloaded this key:
```bash
# Search for the key
find ~ -name "*clean-portal*" -name "*.pem" 2>/dev/null
```

### Option B: Create New Key Pair (if lost)

If you can't find the original key, you'll need to:

1. **Create a new key pair:**
   ```bash
   aws ec2 create-key-pair \
     --key-name clean-portal-deploy-new \
     --query 'KeyMaterial' \
     --output text \
     --region us-east-1 > ~/.ssh/clean-portal-deploy-new.pem
   
   chmod 400 ~/.ssh/clean-portal-deploy-new.pem
   ```

2. **Update EC2 instance to use new key:**
   - This requires AWS Systems Manager Session Manager access OR
   - Using AWS Console to update the instance

3. **Or use AWS Systems Manager (if configured):**
   ```bash
   # This would allow deployments without SSH
   # But requires SSM agent on EC2 and proper IAM roles
   ```

### Option C: Verify Existing Access

Try to connect via AWS Systems Manager:
```bash
aws ssm start-session --target i-05efc928b83a2e0ab --region us-east-1
```

If this works, we can modify the GitHub Actions workflow to use SSM instead of SSH.

## Step 2: Configure GitHub Secrets

Once you have the SSH key, run:

```bash
bash scripts/setup-github-secrets.sh
```

This interactive script will:
1. Set AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
2. Set ECR repository name (ECR_REPOSITORY)
3. Set EC2 configuration (EC2_HOST, EC2_USER, EC2_WORKDIR)
4. Set SSH key (EC2_SSH_KEY)

You'll need to provide:
- ✓ AWS Access Key ID: `AKIAUEJC5CK4JBF6AAHD` (detected)
- ❌ AWS Secret Access Key: (you need to provide this - check AWS IAM console)
- ✓ AWS Region: `us-east-1` (detected)
- ✓ ECR Repository: `clean-portal` (detected)
- ✓ EC2 Host: `44.198.212.206` (detected)
- ✓ EC2 User: `ubuntu` (standard)
- ✓ EC2 Working Directory: `/home/ubuntu/clean-portal` (standard)
- ❌ SSH Private Key: Path to `clean-portal-deploy.pem` (you need to locate this)

## Step 3: Fix Linter Errors

Before deployment can succeed, we need to fix TypeScript errors:

```bash
# Check what errors exist
npm run lint

# Fix the errors (will need to go through each one)
```

Common issues to fix:
- Unused imports
- Type mismatches
- Missing return types
- Any TypeScript compilation errors

## Step 4: Verify GitHub Actions Workflow

The workflow file `.github/workflows/deploy.yml` is configured but currently has:
- ✓ Correct structure
- ✓ Build and push to ECR
- ✓ SSH deployment to EC2
- ⚠️ Quality gates temporarily disabled (line 39)

After fixing linter errors, we should re-enable quality gates:

```yaml
# In .github/workflows/deploy.yml, line 39:
# Change from:
# needs: quality-gates  # Temporarily disabled to allow deployment

# To:
needs: quality-gates
```

## Step 5: Test Deployment

After all secrets are configured and linter errors are fixed:

```bash
# Trigger deployment
git commit --allow-empty -m "test: trigger GitHub Actions deployment"
git push origin main

# Watch the deployment
gh run watch
```

## Troubleshooting

### Issue: Can't Find SSH Key

**Solution 1: Check AWS S3 or parameter store**
```bash
# Check if key was backed up
aws s3 ls s3://your-backup-bucket/ --recursive | grep clean-portal
aws ssm get-parameter --name "/ec2/keypair/clean-portal-deploy" --with-decryption
```

**Solution 2: Use AWS Systems Manager**
Update `.github/workflows/deploy.yml` to use SSM instead of SSH:
```yaml
- name: Deploy over SSM
  run: |
    aws ssm send-command \
      --instance-ids i-05efc928b83a2e0ab \
      --document-name "AWS-RunShellScript" \
      --parameters 'commands=["cd /home/ubuntu/clean-portal && docker compose pull app && docker compose up -d --remove-orphans"]'
```

### Issue: AWS Secret Access Key Unknown

Go to AWS IAM Console:
1. Navigate to IAM > Users > ai-portal-developer
2. Security Credentials tab
3. Create new access key OR retrieve existing one (if stored securely)

### Issue: Linter Errors Too Many

You can temporarily bypass linting (not recommended for production):
```yaml
# In .github/workflows/deploy.yml
# Keep line 39 commented:
# needs: quality-gates  # Temporarily disabled
```

But this should be fixed properly before production use.

## Quick Start

If you want to configure secrets manually (without the script):

```bash
# Set each secret individually
gh secret set AWS_ACCESS_KEY_ID --body "AKIAUEJC5CK4JBF6AAHD"
gh secret set AWS_SECRET_ACCESS_KEY  # Will prompt for value
gh secret set AWS_REGION --body "us-east-1"
gh secret set ECR_REPOSITORY --body "clean-portal"
gh secret set EC2_HOST --body "44.198.212.206"
gh secret set EC2_USER --body "ubuntu"
gh secret set EC2_WORKDIR --body "/home/ubuntu/clean-portal"
gh secret set EC2_SSH_KEY < ~/.ssh/clean-portal-deploy.pem  # Provide key path

# Verify
gh secret list
```

## Expected Outcome

After successful setup, when you push to `main`:

1. ✅ Quality gates run (lint & test)
2. ✅ Docker image builds with commit SHA
3. ✅ Image pushed to ECR
4. ✅ Migrations run on EC2 via SSH
5. ✅ Application deployed on EC2 via SSH
6. ✅ Health check passes

## Next Steps

Choose one:

**A. You have the SSH key:**
1. Run `bash scripts/setup-github-secrets.sh`
2. Fix linter errors with `npm run lint`
3. Test deployment

**B. You don't have the SSH key:**
1. Let me know and I'll help you either:
   - Find it in backups
   - Set up SSM-based deployment (no SSH needed)
   - Create a new key and update EC2

**C. You want to continue with manual deployment:**
1. Keep using `npm run deploy:local`
2. Remove/disable `.github/workflows/deploy.yml`

