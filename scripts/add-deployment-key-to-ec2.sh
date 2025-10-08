#!/bin/bash
# Script to add the new deployment SSH key to EC2 instance
# You'll be prompted for your current SSH key passphrase

set -e

EC2_HOST="44.198.212.206"
NEW_KEY_PUB="$HOME/.ssh/clean-portal-deploy.pub"
EXISTING_KEY="$HOME/.ssh/id_rsa"

echo "🔑 Adding deployment key to EC2 instance..."
echo "You will be prompted for your SSH key passphrase"
echo ""

# Read the public key
PUB_KEY_CONTENT=$(cat "$NEW_KEY_PUB")

# Connect to EC2 and add the key
ssh -i "$EXISTING_KEY" -o StrictHostKeyChecking=no ubuntu@$EC2_HOST << EOF
  echo "Adding deployment key to authorized_keys..."
  echo "$PUB_KEY_CONTENT" >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
  echo "✅ Deployment key added successfully!"
  echo ""
  echo "Testing new key..."
EOF

# Test the new key
echo ""
echo "Testing new deployment key..."
if ssh -i "$HOME/.ssh/clean-portal-deploy" -o StrictHostKeyChecking=no -o ConnectTimeout=5 ubuntu@$EC2_HOST "echo '✅ New key works!'" ; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║          🎉 Deployment Key Setup Complete! 🎉           ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  echo "Next step: Update GitHub secret with new key"
  echo "Run: cat ~/.ssh/clean-portal-deploy | gh secret set EC2_SSH_KEY"
else
  echo "❌ Failed to connect with new key"
  exit 1
fi


