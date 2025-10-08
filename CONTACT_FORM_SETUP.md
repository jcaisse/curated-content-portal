# Contact Form Setup Guide

This guide walks you through setting up the contact form with Amazon SES and Google reCAPTCHA.

## Overview

The contact form uses:
- **Amazon SES** - Email delivery service for sending contact form submissions
- **Google reCAPTCHA v2** - Bot protection to prevent spam submissions

## Prerequisites

- AWS account with SES access
- Google account for reCAPTCHA

---

## Part 1: AWS SES Setup

### Step 1: Create AWS IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Add users**
3. Username: `corsoro-ses-user` (or any name you prefer)
4. Select **Access key - Programmatic access**
5. Click **Next: Permissions**

### Step 2: Attach SES Send Policy

1. Click **Attach existing policies directly**
2. Click **Create policy**
3. Select **JSON** tab and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

4. Name it `SES-SendEmail-Policy`
5. Attach this policy to your user
6. Complete user creation and **save the credentials**:
   - Access Key ID
   - Secret Access Key

### Step 3: Verify Email Addresses in SES

#### If in SES Sandbox (default for new accounts):

1. Go to [Amazon SES Console](https://console.aws.amazon.com/ses/)
2. Navigate to **Verified identities**
3. Click **Create identity**
4. Select **Email address**
5. Enter your **sender email** (e.g., `noreply@corsoro.com`)
6. Click **Create identity**
7. Check your inbox and verify the email

8. **Repeat for recipient email** (e.g., `partnerships@corsoro.com`)

> **Note:** In sandbox mode, you can only send to verified email addresses. For production, request SES production access.

#### Request Production Access (Recommended):

1. In SES Console, click **Account dashboard**
2. Click **Request production access**
3. Fill out the form:
   - **Mail type:** Transactional
   - **Website URL:** `https://www.corsoro.com`
   - **Use case description:** "Contact form submissions for business partnership inquiries"
   - **Compliance:** Confirm you will only send to users who requested it
4. Submit and wait for approval (typically 24 hours)

### Step 4: Choose Your Region

AWS SES is regional. Common regions:
- `us-east-1` (N. Virginia) - Default, cheapest
- `us-west-2` (Oregon)
- `eu-west-1` (Ireland)

Make note of your region for the environment variables.

---

## Part 2: Google reCAPTCHA Setup

### Step 1: Register Your Site

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **+** to create a new site
3. Fill in the form:
   - **Label:** Corsoro Contact Form
   - **reCAPTCHA type:** Select **reCAPTCHA v2** → **"I'm not a robot" Checkbox**
   - **Domains:** Add your domains:
     - `localhost` (for local development)
     - `www.corsoro.com`
     - `corsoro.com`
     - `portal.spoot.com` (if applicable)
   - **Accept reCAPTCHA Terms of Service**
4. Click **Submit**

### Step 2: Get Your Keys

After creating the site, you'll see:
- **Site Key** (starts with `6L...`) - This is public and goes in `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- **Secret Key** - This is private and goes in `RECAPTCHA_SECRET_KEY`

---

## Part 3: Configure Environment Variables

### Local Development

Add these variables to `.secrets/.env.local`:

```bash
# AWS SES Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
SES_FROM_EMAIL="noreply@corsoro.com"
CONTACT_EMAIL="partnerships@corsoro.com"

# Google reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6L..."
RECAPTCHA_SECRET_KEY="your-secret-key"
```

### Production (EC2)

Add the same variables to your production environment file or AWS Systems Manager Parameter Store.

**Option A: Environment File on EC2**

SSH into your EC2 instance and add variables to `.env` or your production env file.

**Option B: AWS Systems Manager Parameter Store** (More secure)

```bash
aws ssm put-parameter \
  --name "/corsoro/prod/aws-access-key-id" \
  --value "YOUR_KEY" \
  --type SecureString

aws ssm put-parameter \
  --name "/corsoro/prod/aws-secret-access-key" \
  --value "YOUR_SECRET" \
  --type SecureString
```

Then update your app to read from Parameter Store.

---

## Part 4: Test the Form

### Local Testing

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/#contact`

3. Fill out the form and submit

4. Check:
   - reCAPTCHA appears
   - Form submits without errors
   - Email arrives at `CONTACT_EMAIL`

### Production Testing

After deploying:

1. Visit `https://www.corsoro.com/#contact`
2. Submit a test message
3. Verify email delivery

---

## Troubleshooting

### reCAPTCHA Not Showing

- Check `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set and starts with `6L`
- Verify domain is added in reCAPTCHA admin console
- Check browser console for errors

### Email Not Sending

**Error: "Email address is not verified"**
- Solution: Verify email in SES console or request production access

**Error: "Invalid AWS credentials"**
- Solution: Double-check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

**Error: "User is not authorized to perform: ses:SendEmail"**
- Solution: Ensure IAM user has the SES send policy attached

**Email goes to spam:**
- Set up SPF, DKIM, and DMARC records for your domain
- In SES Console, verify domain (not just email) to enable DKIM signing

### Form Submission Fails

- Check browser Network tab for API response
- Check server logs for detailed error messages
- Verify all environment variables are set

---

## Security Best Practices

1. **Never commit credentials** to Git
2. **Use IAM roles** on EC2 instead of access keys (recommended for production)
3. **Rotate keys** regularly
4. **Limit IAM permissions** to only SES send operations
5. **Monitor SES usage** to detect abuse
6. **Enable CloudWatch alarms** for high send volumes

---

## Cost Estimates

### AWS SES Pricing (as of 2024)

- **Sandbox:** Free (limited to verified emails)
- **Production:**
  - First 62,000 emails/month: **$0** (when sending from EC2)
  - Additional emails: **$0.10 per 1,000 emails**

### Google reCAPTCHA

- **Free** for most websites
- Enterprise pricing available for high-volume sites

**Example:** If you receive 100 contact forms per month, your cost is effectively **$0**.

---

## Next Steps

After setup is complete:

1. ✅ Test form locally
2. ✅ Deploy to production
3. ✅ Monitor email delivery in SES Console
4. ✅ Set up email forwarding/CRM integration (optional)
5. ✅ Configure SPF/DKIM for your domain (recommended)

---

## Support

- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha)
- [AWS SES Troubleshooting Guide](https://docs.aws.amazon.com/ses/latest/dg/troubleshoot.html)
