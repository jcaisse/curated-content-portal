# Contact Form Quick Reference

## ✅ Implementation Complete

The contact form now includes:
- **Amazon SES** email delivery
- **Google reCAPTCHA v2** bot protection
- Form validation and error handling
- Success/error state management
- Fallback mailto: link

---

## 🔑 Required Environment Variables

Add these to your `.secrets/.env.local` and production environment:

```bash
# AWS SES
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY"
AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY"
SES_FROM_EMAIL="noreply@corsoro.com"
CONTACT_EMAIL="partnerships@corsoro.com"

# Google reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6L..."
RECAPTCHA_SECRET_KEY="your-secret-key"
```

---

## 🚀 Quick Setup Steps

1. **Get AWS SES Keys:**
   - Create IAM user with SES send permissions
   - Save Access Key ID and Secret Access Key
   - Verify sender email in SES Console

2. **Get reCAPTCHA Keys:**
   - Visit https://www.google.com/recaptcha/admin
   - Register your domain(s)
   - Get Site Key and Secret Key

3. **Add Environment Variables:**
   - Update `.secrets/.env.local` for development
   - Update production environment on EC2

4. **Test:**
   - Restart dev server: `npm run dev`
   - Submit test form at `http://localhost:3000/#contact`

---

## 📧 Email Flow

When a user submits the form:

1. Frontend validates required fields
2. reCAPTCHA verifies user is human
3. Form data sent to `/api/contact` endpoint
4. Backend validates and verifies reCAPTCHA token with Google
5. Email sent via AWS SES to `CONTACT_EMAIL`
6. User sees success message

---

## 🛡️ Security Features

- ✅ reCAPTCHA bot protection
- ✅ Server-side reCAPTCHA verification
- ✅ Email validation
- ✅ Required field validation
- ✅ AWS credentials stored securely in env vars
- ✅ Reply-to header for easy responses

---

## 📁 Files Modified

**New Files:**
- `src/app/api/contact/route.ts` - API endpoint for form submission
- `CONTACT_FORM_SETUP.md` - Detailed setup guide
- `CONTACT_FORM_QUICK_REFERENCE.md` - This file

**Modified Files:**
- `src/components/marketing/cta-section.tsx` - Updated with reCAPTCHA and submission logic
- `env.example` - Added new environment variable examples
- `package.json` - Added AWS SES SDK and reCAPTCHA packages

---

## 🎨 UI Features

- Loading state with "Processing..." text
- Success screen with checkmark icon
- Error messages for validation/submission failures
- Disabled submit button until reCAPTCHA is completed
- Dark theme reCAPTCHA widget
- Fallback mailto: link

---

## 💰 Cost

**AWS SES:**
- First 62,000 emails/month from EC2: **FREE**
- Additional: $0.10 per 1,000 emails

**Google reCAPTCHA:**
- **FREE** for standard use

**Typical monthly cost for 100 contact forms: $0**

---

## 📚 Full Documentation

See `CONTACT_FORM_SETUP.md` for:
- Detailed AWS SES setup with screenshots
- reCAPTCHA configuration steps
- Troubleshooting guide
- Security best practices
- Production deployment tips

---

## ⚠️ Important Notes

1. **SES Sandbox Mode:**
   - By default, SES is in sandbox mode
   - Can only send to verified email addresses
   - Request production access for unrestricted sending

2. **Domain Verification:**
   - For local testing, verify both sender and recipient emails
   - For production, verify your domain for DKIM signing

3. **reCAPTCHA Domains:**
   - Add all domains (localhost, www.corsoro.com, etc.) in reCAPTCHA admin

---

## 🧪 Testing Checklist

- [ ] reCAPTCHA widget appears
- [ ] Form validates required fields
- [ ] Submit button disabled without reCAPTCHA
- [ ] Email arrives at `CONTACT_EMAIL`
- [ ] Reply-to address is set to submitter's email
- [ ] Success message displays after submission
- [ ] Error messages show for failures
- [ ] Mailto link works as fallback

---

## 🔧 Troubleshooting Commands

**Check SES sending limits:**
```bash
aws ses get-send-quota --region us-east-1
```

**Test SES email sending:**
```bash
aws ses send-email \
  --from noreply@corsoro.com \
  --destination ToAddresses=partnerships@corsoro.com \
  --message Subject={Data="Test"},Body={Text={Data="Test message"}} \
  --region us-east-1
```

**Check IAM permissions:**
```bash
aws iam get-user-policy --user-name corsoro-ses-user --policy-name SES-SendEmail-Policy
```
