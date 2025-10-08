#!/bin/bash
# Copy and paste these commands one section at a time

echo "════════════════════════════════════════════════════════════════"
echo "STEP 1: Add SSH key to EC2 via Instance Connect"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Run this command to connect via Instance Connect and add the key:"
echo ""

# This uses AWS CLI to send the temporary key and immediately connect
aws ec2-instance-connect send-ssh-public-key \
  --instance-id i-05efc928b83a2e0ab \
  --availability-zone us-east-1b \
  --instance-os-user ubuntu \
  --ssh-public-key "file://$HOME/.ssh/clean-portal-deploy.pub" \
  --region us-east-1 && \
ssh -i ~/.ssh/clean-portal-deploy \
  -o "IdentitiesOnly=yes" \
  -o "StrictHostKeyChecking=no" \
  ubuntu@44.198.212.206 \
  'echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC/OgLJ0r3SGmVLpns3ItMNvablf3W8ViwZkZl8w6ptLuq5dYHXNELQv7o3FODYtdWfbC+KRGGnempmOsOgv3z+ncTF9QlLyzRgJGrXCXHq6UZcwi3EnIYullVIJ8yZf4O0CC6kUUz1MHZveFZlN7ZTZMME9rOzaG5sCEAmzY1vsGerCf1EUWvFWxiKqAufu3nN6PRVxJstHZ630zQBdWXg2ZOSbzvZvMqbo3fm64kPsRBfz2hDgWRsB4oUZUA1T/6CT1vNY1we6/iGlM+6vmzpZbBYsl9Pt6iYZoAGJgIqsRi/tYILNTFRYTLv+GKeEbQBtWvJMO3wwBN1EaKjz/93Kk3JO0swwAulnx760VaV5jBhtN14ipUfBCile3z+L1ZAFW08Nt3DOLG6U44lUptfW3vLZphwFbUwuzaYdxQr5/CDX5QqevElhfUj9JDZTGsL8Y0OEB6k7aRRyX48AM+eo/FlffeQm3p4VmQfW+2q7zB3EQVHFie68JhVNfq9s/zGVWHp5gFR5z9P1IDq/qbJLmjWuXhWnm+9uePlFXCVbwBxkvn4uQBebN1/VL/d64nVsdeP2RFH5b812xV7X5JG5do3evubUr37cEudhj6MB2SDtRr0MtQHnnp4u5/JoplULR6/WLW+XqtSDsW+2JuwO/2SI1WoB7Ukv/3tBTeiow== clean-portal-deployment" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo "✅ Key added successfully!"'

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "STEP 2: Test SSH Connection"
echo "════════════════════════════════════════════════════════════════"
echo ""

ssh -i ~/.ssh/clean-portal-deploy ubuntu@44.198.212.206 "echo '✅ SSH connection works!' && docker --version"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "STEP 3: Update GitHub Secret"
echo "════════════════════════════════════════════════════════════════"
echo ""

cat ~/.ssh/clean-portal-deploy | gh secret set EC2_SSH_KEY

echo "✅ GitHub secret updated!"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "STEP 4: Trigger Deployment"
echo "════════════════════════════════════════════════════════════════"
echo ""

git commit --allow-empty -m "deploy: trigger deployment after SSH key fix" && git push origin main

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "STEP 5: Watch Deployment"
echo "════════════════════════════════════════════════════════════════"
echo ""

sleep 5 && gh run watch $(gh run list --workflow=deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')

