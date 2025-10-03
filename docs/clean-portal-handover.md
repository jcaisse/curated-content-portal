# Clean Portal Prototype – AWS Deployment Handover

This document mirrors the instructions shared in chat so another assistant (e.g. Claude) can provision and verify the prototype infrastructure end to end.

## Goal
Deploy the Clean Portal Next.js prototype on AWS using a single EC2 instance (Docker Compose) with DNS served from Route53. CI/CD (GitHub Actions) will build/push the container, run Prisma migrations on the host, redeploy, and smoke-test.

## Credentials (already issued)

| Item | Value |
|------|-------|
| IAM user | `ci-clean-portal` |
| Access Key ID | `<AWS_ACCESS_KEY_ID>` (stored in GitHub Secrets) |
| Secret Access Key | `<AWS_SECRET_ACCESS_KEY>` (stored in GitHub Secrets) |
| Region | `us-east-1` |
| Secrets | `DATABASE_URL`, `NEXTAUTH_SECRET`, `ADMIN_INGEST_KEY`, `OPENAI_API_KEY` |

## Target Infrastructure

| Component | Notes |
|-----------|-------|
| EC2 | Amazon Linux 2023, `t3.medium`, default VPC |
| Security Group | `clean-portal-sg`, inbound TCP 22/80 from 0.0.0.0/0 (prototype only) |
| Elastic IP | Associated with the instance |
| Key Pair | `clean-portal-deploy` |
| Docker Compose | `app` + `db` services from `ops/docker-compose.prod.yml` |
| Route53 | Hosted zone `spoot.com`, records for `portal` and `*.portal` |
| Github Secrets | AWS creds, ECR repo, EC2 host info, SSH key |

## AWS Provisioning Steps

1. **Clean slate** – terminate existing instances, release EIPs, delete security group (if present). See commands in `ops/runbooks/aws-prototype-deploy.md` Section 1.
2. **Create key pair, security group, launch EC2** using the scripted commands in Section 2 of the runbook. Capture `INSTANCE_ID`, `SG_ID`, `ALLOC_ID`, `PUBLIC_IP`.
3. **Bootstrap host** with Docker + compose, upload deployment files, create `.env`, and run `docker-compose up -d` as outlined in Sections 3–8 of the runbook.
4. **Verify HTTP** via `curl -i http://<PUBLIC_IP>`.
5. **Optional:** Store secrets in SSM (Section 9).
6. **Route53 setup** – create hosted zone `spoot.com`, add records for `portal` and `*.portal`, update registrar with NS records (Section 10).
7. **GitHub configuration** – add repository secrets, create ECR repo, perform initial image push, pull on EC2 (Sections 11–13).

## Verification Checklist

1. `aws ec2 describe-instances` shows the instance running with `clean-portal-sg` and correct EIP.
2. `docker ps` on the host lists `clean-portal_app_1` and `clean-portal_db_1`.
3. `curl -i http://<PUBLIC_IP>` returns HTTP 200 with the portal sign-in HTML.
4. `dig +short portal.spoot.com` resolves to the EIP after NS changes.
5. GitHub Actions run (on branch `main`) succeeds through build → migrate → deploy → smoke test.
6. Optional: `docker-compose logs app` shows no startup errors.

## Evidence to Capture Before Returning

- `PUBLIC_IP`, `INSTANCE_ID`, `SG_ID`, `ALLOC_ID` values.
- Hosted zone ID and NS records (for registrar update).
- Outputs of verification commands above.
- Screenshot or link to successful GitHub workflow run.
- Confirmation the site loads via browser at `http://<PUBLIC_IP>` and `https://portal.spoot.com` (after DNS propagation).

## References

- `ops/runbooks/aws-prototype-deploy.md` – command-by-command runbook.
- `.github/workflows/deploy.yml` – CI pipeline definition.
- `ops/docker-compose.prod.yml` – compose stack deployed on EC2.


