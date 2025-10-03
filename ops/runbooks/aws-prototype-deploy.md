# AWS Prototype Deployment Runbook

This guide assumes you have:

- AWS CLI v2 installed and configured with the `ci-clean-portal` access key (`aws configure --profile ci-clean-portal`).
- jq + docker + docker compose on your local machine.
- The secrets provided earlier (`DATABASE_URL`, `NEXTAUTH_SECRET`, `ADMIN_INGEST_KEY`, `OPENAI_API_KEY`).

> Replace `${PROFILE}` with `ci-clean-portal` unless you chose a different profile name.

## 1. Create key pair for SSH/CI

```bash
aws ec2 create-key-pair \
  --profile ci-clean-portal \
  --region us-east-1 \
  --key-name clean-portal-deploy \
  --query 'KeyMaterial' \
  --output text > clean-portal-deploy.pem
chmod 400 clean-portal-deploy.pem
```

Upload the private key content into GitHub secret `EC2_SSH_KEY` after steps below. Keep the `.pem` locally for emergency access.

## 2. Create security group

```bash
SG_ID=$(aws ec2 create-security-group \
  --profile ci-clean-portal \
  --region us-east-1 \
  --group-name clean-portal-sg \
  --description "clean portal prototype" \
  --query 'GroupId' --output text)

aws ec2 authorize-security-group-ingress --profile ${PROFILE} --region us-east-1 \
  --group-id "$SG_ID" --protocol tcp --port 22 --cidr YOUR_IP/32
aws ec2 authorize-security-group-ingress --profile ${PROFILE} --region us-east-1 \
  --group-id "$SG_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0
```

Replace `YOUR_IP` with your public IP (e.g. from https://ifconfig.co). You can broaden or add more CIDRs as needed.

## 3. Launch EC2 instance

```bash
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters 'Name=name,Values=al2023-ami-2023.*-kernel-6.1-*' 'Name=architecture,Values=x86_64' \
  --query 'Images | sort_by(@, &CreationDate)[-1].ImageId' --output text --region us-east-1)

INSTANCE_ID=$(aws ec2 run-instances \
  --profile ${PROFILE} --region us-east-1 \
  --image-id "$AMI_ID" --instance-type t3.medium \
  --key-name clean-portal-deploy \
  --security-group-ids "$SG_ID" \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=clean-portal-ec2}]' \
  --query 'Instances[0].InstanceId' --output text)

aws ec2 wait instance-status-ok --profile ${PROFILE} --region us-east-1 --instance-ids "$INSTANCE_ID"
```

## 4. Allocate and associate Elastic IP

```bash
ALLOC_ID=$(aws ec2 allocate-address --profile ${PROFILE} --region us-east-1 --domain vpc --query 'AllocationId' --output text)

aws ec2 associate-address --profile ${PROFILE} --region us-east-1 \
  --instance-id "$INSTANCE_ID" --allocation-id "$ALLOC_ID"

PUBLIC_IP=$(aws ec2 describe-addresses --profile ${PROFILE} --region us-east-1 --allocation-ids "$ALLOC_ID" --query 'Addresses[0].PublicIp' --output text)
echo "Elastic IP: $PUBLIC_IP"
```

## 5. Bootstrap instance (install docker & compose)

```bash
ssh -i clean-portal-deploy.pem ec2-user@${PUBLIC_IP} <<'EOF'
set -e
sudo yum update -y
sudo yum install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

DOCKER_COMPOSE_VERSION=2.24.6
sudo curl -SL "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

mkdir -p /opt/clean-portal
EOF
```

Reconnect (new shell) to gain docker group membership.

## 6. Upload project files & compose stack

```bash
scp -i clean-portal-deploy.pem -r ops docker-compose.prod.yml things\ Joey\ needs\ to\ do.md ec2-user@${PUBLIC_IP}:/opt/clean-portal/

ssh -i clean-portal-deploy.pem ec2-user@${PUBLIC_IP} <<'EOF'
cd /opt/clean-portal
mv docker-compose.prod.yml docker-compose.yml
EOF
```

## 7. Create `.env` on instance

```bash
ssh -i clean-portal-deploy.pem ec2-user@${PUBLIC_IP} <<'EOF'
cat <<'ENV' > /opt/clean-portal/.env
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/app?schema=public"
NEXTAUTH_SECRET="<NEXTAUTH_SECRET_FROM_GITHUB_SECRETS>"
ADMIN_INGEST_KEY="<ADMIN_INGEST_KEY_FROM_GITHUB_SECRETS>"
OPENAI_API_KEY="<OPENAI_API_KEY_FROM_GITHUB_SECRETS>"
POSTGRES_PASSWORD="$(openssl rand -hex 16)"
ENV
EOF
```

> Note: Adjust variables as needed before running. The command above generates a random password but keep it somewhere safe.

## 8. Start the stack (first time)

```bash
ssh -i clean-portal-deploy.pem ec2-user@${PUBLIC_IP} <<'EOF'
cd /opt/clean-portal
docker-compose up -d
EOF
```

After a few seconds `curl http://${PUBLIC_IP}` should show the portal.

## 9. Store secrets in SSM Parameter Store (optional but recommended)

```bash
aws ssm put-parameter --profile ${PROFILE} --region us-east-1 --name /clean-portal/prod/DATABASE_URL --type SecureString --value "postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/app?schema=public" --overwrite
aws ssm put-parameter --profile ${PROFILE} --region us-east-1 --name /clean-portal/prod/NEXTAUTH_SECRET --type SecureString --value "<NEXTAUTH_SECRET>" --overwrite
aws ssm put-parameter --profile ${PROFILE} --region us-east-1 --name /clean-portal/prod/ADMIN_INGEST_KEY --type SecureString --value "<ADMIN_INGEST_KEY>" --overwrite
aws ssm put-parameter --profile ${PROFILE} --region us-east-1 --name /clean-portal/prod/OPENAI_API_KEY --type SecureString --value "<OPENAI_API_KEY>" --overwrite
```

## 10. Create Route53 hosted zone & records

```bash
HOSTED_ZONE_ID=$(aws route53 create-hosted-zone --profile ${PROFILE} --region us-east-1 \
  --name spoot.com --caller-reference $(date +%s) \
  --query 'HostedZone.Id' --output text)

aws route53 change-resource-record-sets --profile ${PROFILE} --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch ' {
  "Changes": [
    {"Action": "UPSERT", "ResourceRecordSet": {"Name": "portal.spoot.com", "Type": "A", "TTL": 300, "ResourceRecords": [{"Value": "'"$PUBLIC_IP"'"}]}},
    {"Action": "UPSERT", "ResourceRecordSet": {"Name": "*.portal.spoot.com", "Type": "A", "TTL": 300, "ResourceRecords": [{"Value": "'"$PUBLIC_IP"'"}]}}
  ]
}'
```

Copy the NS records returned by `create-hosted-zone` and update them at your registrar.

## 11. Configure GitHub secrets

Set these secrets in the repository settings:

- `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` (from `ci-clean-portal` user)
- `AWS_REGION` = `us-east-1`
- `ECR_REPOSITORY` = `clean-portal`
- `ECR_REGISTRY` = `<account-id>.dkr.ecr.us-east-1.amazonaws.com`
- `EC2_HOST` = `${PUBLIC_IP}`
- `EC2_USER` = `ec2-user`
- `EC2_WORKDIR` = `/opt/clean-portal`
- `EC2_SSH_KEY` = contents of `clean-portal-deploy.pem`

## 12. Initialize ECR repository

```bash
aws ecr create-repository --profile ${PROFILE} --region us-east-1 --repository-name clean-portal
```

## 13. Push initial image

```bash
aws ecr get-login-password --profile ${PROFILE} --region us-east-1 | docker login --username AWS --password-stdin ${ECR_REGISTRY}

docker build -t ${ECR_REGISTRY}/clean-portal:prototype .
docker tag ${ECR_REGISTRY}/clean-portal:prototype ${ECR_REGISTRY}/clean-portal:latest
docker push ${ECR_REGISTRY}/clean-portal:prototype
docker push ${ECR_REGISTRY}/clean-portal:latest
```

Pull new image on EC2:

```bash
ssh -i clean-portal-deploy.pem ec2-user@${PUBLIC_IP} <<'EOF'
cd /opt/clean-portal
docker-compose pull app
docker-compose up -d
EOF
```

## 14. Validate

- `curl http://portal.spoot.com` (after DNS propagates).
- Log into the admin portal, run a crawler, ensure moderation queue + portal pages work.

## 15. Enable GitHub Actions deployment

Once secrets are configured and the workflow committed, merges to `main` will trigger the pipeline:

1. Lint & test
2. Build & push Docker image
3. Run Prisma migrations on EC2
4. Deploy updated compose stack
5. Smoke-test endpoint

Monitor runs in **Actions** tab.

---

Keep `clean-portal-deploy.pem` safe and rotate the CI IAM credentials on a schedule. For production, consider moving DB to RDS and adding TLS termination (e.g., Caddy or ALB + ACM).


