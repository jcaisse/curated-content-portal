# Things Joey Needs to Do

## Step 1 – Create IAM user & access keys
1. **Sign in to AWS console** at https://console.aws.amazon.com/ (make sure you’re in the right account).
2. In the services search bar type **IAM** and open **IAM**.
3. On the left menu choose **Users** → **Add users**.
4. Enter user name: `ci-clean-portal`.
5. Leave console access unchecked and click **Next** (AWS will ask for access type later).
6. On the **Set permissions** page choose **Attach existing policies directly**.
7. Click **Create policy** in a new tab (leave the user wizard open):
   - Choose **JSON** tab and paste this policy granting everything we’ll need:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {"Effect":"Allow","Action":["ecr:*"] ,"Resource":"*"},
         {"Effect":"Allow","Action":["ec2:Describe*","ec2:RunInstances","ec2:TerminateInstances","ec2:CreateTags","ec2:CreateSecurityGroup","ec2:AuthorizeSecurityGroupIngress","ec2:AllocateAddress","ec2:AssociateAddress","ec2:DisassociateAddress","ec2:CreateKeyPair"],"Resource":"*"},
         {"Effect":"Allow","Action":["ssm:PutParameter","ssm:GetParameter","ssm:AddTagsToResource"],"Resource":"*"},
         {"Effect":"Allow","Action":["route53:ListHostedZones","route53:CreateHostedZone","route53:GetHostedZone","route53:ChangeResourceRecordSets"],"Resource":"*"}
       ]
     }
     ```
   - Click **Next**, name it `CleanPortalCICDPolicy`, create policy, close tab.
8. Back in the user wizard, refresh policies, search `CleanPortalCICDPolicy`, check it (ensure only this policy is attached).
9. Click **Next: Tags** (optional to add tag `Purpose=CI`).
10. Click **Next: Review**.
11. On the final screen expand **Access options**, tick **Programmatic access** so AWS generates an access key.
12. Click **Create user**.
13. Download the CSV or copy **Access key ID** and **Secret access key** (save securely for sharing with assistant).

## Step 2 – Capture environment context
1. In AWS console open **EC2** service.
2. Find the EC2 instance that will host the app. Record:
   - **Instance ID** (e.g., `i-0abc123`)
   - **Availability Zone** and **VPC/Subnet** (visible in instance details)
   - If you already allocated an Elastic IP: go to **Elastic IPs** (left menu) note the **Allocation ID**; otherwise note that you need one allocated.
3. List environment variables required (copy from `.env.local`):
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `ADMIN_INGEST_KEY`
   - any other secrets (OpenAI key, etc.)
4. Confirm preferred AWS region (default `us-east-1`).

## Step 3 – Share credentials & access
1. Send the assistant (secure channel) the following:
- AWS account ID (12-digit).
- Region.
- IAM user Access Key ID & Secret Access Key.
- EC2 instance ID (and Elastic IP if exists).
- List of env vars + values for SSM store.
2. Provide GitHub repository admin access (temporary is fine) so secrets can be added; or send secrets and the assistant will give the exact key names to paste.
3. SSH key options:
   - If you have an existing SSH public key, send the **public** key so it can be authorized on EC2.
   - If not, indicate that the assistant should generate one; they’ll send you the public part for record keeping.

## Step 4 – Update registrar after Route53 setup
1. Once informed that the Route53 hosted zone for `spoot.com` is ready, you’ll receive 4 name server (NS) records (e.g., `ns-XXXX.awsdns-xx.org`).
2. Log into your domain registrar (where `spoot.com` is registered).
3. Locate the DNS or name server settings.
4. Replace existing name servers with the four provided from Route53.
5. Save/confirm the change. Propagation can take up to 24 hours (usually much faster).
6. Notify the assistant once done so DNS records (wildcard + portal) can be finalized.

---
After finishing Steps 1–3, ping the assistant with the details above. They will handle AWS configuration, GitHub Actions secrets, Route53 zone, and deployment setup. Once the NS change (Step 4) is complete, let them know so they can finalize DNS.

