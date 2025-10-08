# EC2 SSH Key Issue - Manual Fix Required

## Problem

The GitHub Actions deployment cannot SSH into the EC2 instance because none of the available SSH keys are authorized on the instance.

**EC2 Instance:** `i-05efc928b83a2e0ab` (clean-portal-ec2 at 44.198.212.206)
**Key Pair Name:** `clean-portal-deploy`

## Keys We Tried

1. ✗ `~/.ssh/id_rsa` - Has passphrase, not authorized on EC2
2. ✗ `clean-portal-deploy.pem` - No passphrase, but not authorized on EC2  
3. ✗ `~/.ssh/clean-portal-deploy` - Newly created, not authorized on EC2

## Solution Options

### Option 1: Add Public Key via AWS Console (Recommended)

1. **Generate/use a deployment key:**
   ```bash
   cat ~/.ssh/clean-portal-deploy.pub
   ```
   Copy this public key:
   ```
   ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC/OgLJ0r3SGmVLpns3ItMNvablf3W8ViwZkZl8w6ptLuq5dYHXNELQv7o3FODYtdWfbC+KRGGnempmOsOgv3z+ncTF9QlLyzRgJGrXCXHq6UZcwi3EnIYullVIJ8yZf4O0CC6kUUz1MHZveFZlN7ZTZMME9rOzaG5sCEAmzY1vsGerCf1EUWvFWxiKqAufu3nN6PRVxJstHZ630zQBdWXg2ZOSbzvZvMqbo3fm64kPsRBfz2hDgWRsB4oUZUA1T/6CT1vNY1we6/iGlM+6vmzpZbBYsl9Pt6iYZoAGJgIqsRi/tYILNTFRYTLv+GKeEbQBtWvJMO3wwBN1EaKjz/93Kk3JO0swwAulnx760VaV5jBhtN14ipUfBCile3z+L1ZAFW08Nt3DOLG6U44lUptfW3vLZphwFbUwuzaYdxQr5/CDX5QqevElhfUj9JDZTGsL8Y0OEB6k7aRRyX48AM+eo/FlffeQm3p4VmQfW+2q7zB3EQVHFie68JhVNfq9s/zGVWHp5gFR5z9P1IDq/qbJLmjWuXhWnm+9uePlFXCVbwBxkvn4uQBebN1/VL/d64nVsdeP2RFH5b812xV7X5JG5do3evubUr37cEudhj6MB2SDtRr0MtQHnnp4u5/JoplULR6/WLW+XqtSDsW+2JuwO/2SI1WoB7Ukv/3tBTeiow== clean-portal-deployment
   ```

2. **Connect to EC2 via AWS Console:**
   - Go to AWS Console → EC2 → Instances
   - Select instance `i-05efc928b83a2e0ab` (clean-portal-ec2)
   - Click "Connect" button
   - Choose "EC2 Instance Connect" tab
   - Click "Connect" (opens browser-based terminal)

3. **Add the public key:**
   In the EC2 Instance Connect terminal:
   ```bash
   echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC/OgLJ0r3SGmVLpns3ItMNvablf3W8ViwZkZl8w6ptLuq5dYHXNELQv7o3FODYtdWfbC+KRGGnempmOsOgv3z+ncTF9QlLyzRgJGrXCXHq6UZcwi3EnIYullVIJ8yZf4O0CC6kUUz1MHZveFZlN7ZTZMME9rOzaG5sCEAmzY1vsGerCf1EUWvFWxiKqAufu3nN6PRVxJstHZ630zQBdWXg2ZOSbzvZvMqbo3fm64kPsRBfz2hDgWRsB4oUZUA1T/6CT1vNY1we6/iGlM+6vmzpZbBYsl9Pt6iYZoAGJgIqsRi/tYILNTFRYTLv+GKeEbQBtWvJMO3wwBN1EaKjz/93Kk3JO0swwAulnx760VaV5jBhtN14ipUfBCile3z+L1ZAFW08Nt3DOLG6U44lUptfW3vLZphwFbUwuzaYdxQr5/CDX5QqevElhfUj9JDZTGsL8Y0OEB6k7aRRyX48AM+eo/FlffeQm3p4VmQfW+2q7zB3EQVHFie68JhVNfq9s/zGVWHp5gFR5z9P1IDq/qbJLmjWuXhWnm+9uePlFXCVbwBxkvn4uQBebN1/VL/d64nVsdeP2RFH5b812xV7X5JG5do3evubUr37cEudhj6MB2SDtRr0MtQHnnp4u5/JoplULR6/WLW+XqtSDsW+2JuwO/2SI1WoB7Ukv/3tBTeiow== clean-portal-deployment" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

4. **Test the connection locally:**
   ```bash
   ssh -i ~/.ssh/clean-portal-deploy ubuntu@44.198.212.206 "echo 'Connection successful!'"
   ```

5. **Update GitHub secret:**
   ```bash
   cat ~/.ssh/clean-portal-deploy | gh secret set EC2_SSH_KEY
   ```

6. **Trigger deployment:**
   ```bash
   git commit --allow-empty -m "test: deployment after SSH key fix" && git push
   ```

### Option 2: Use EC2 User Data to Add Key

If you can't access via Console but can modify instance:

1. Stop the instance
2. Edit User Data to add the public key
3. Start the instance
4. Test SSH
5. Deploy

### Option 3: Alternative Deployment Without SSH

Modify `.github/workflows/deploy.yml` to use a different deployment method:

#### A. AWS CodeDeploy
- Set up CodeDeploy application
- Update workflow to trigger CodeDeploy
- No SSH needed

#### B. Docker Registry Pull on EC2  
- Set up a cron job or systemd timer on EC2 to pull and restart
- GitHub Actions only builds and pushes to ECR
- EC2 pulls independently

#### C. AWS ECS/Fargate
- Migrate from EC2 to ECS
- Fully managed container deployment
- No SSH needed

## Current Status

✅ Docker image builds successfully  
✅ Image pushes to ECR successfully  
❌ SSH authentication fails on migrations step  
❌ Deployment blocked

## What's Already Configured

- AWS Credentials: ✅ Working
- ECR Repository: ✅ Working (`284077920952.dkr.ecr.us-east-1.amazonaws.com/clean-portal`)
- GitHub Secrets: ✅ All 8 configured
- SSH Key (GitHub): ❌ Not authorized on EC2

## Quick Test

After adding the key to EC2, test locally:

```bash
# Should succeed after fix
ssh -i ~/.ssh/clean-portal-deploy ubuntu@44.198.212.206 "echo 'Success!' && docker --version"
```

## Next Steps

1. Choose Option 1, 2, or 3 above
2. Implement the fix
3. Test SSH connection
4. Trigger new deployment
5. Monitor GitHub Actions workflow

---

**Need help with any of these steps? Let me know which option you'd like to pursue!**


