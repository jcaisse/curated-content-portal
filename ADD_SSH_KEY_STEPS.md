# Quick Steps to Fix Deployment

## What You Need to Do (5 minutes)

### Step 1: Connect to EC2 via AWS Console

1. Go to: https://console.aws.amazon.com/ec2/
2. Find instance: `clean-portal-ec2` (i-05efc928b83a2e0ab)
3. Click **"Connect"** button (top right)
4. Choose **"EC2 Instance Connect"** tab
5. Click **"Connect"** button

### Step 2: Add SSH Key (Copy/Paste Command)

In the browser terminal that opens, paste this command:

```bash
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC/OgLJ0r3SGmVLpns3ItMNvablf3W8ViwZkZl8w6ptLuq5dYHXNELQv7o3FODYtdWfbC+KRGGnempmOsOgv3z+ncTF9QlLyzRgJGrXCXHq6UZcwi3EnIYullVIJ8yZf4O0CC6kUUz1MHZveFZlN7ZTZMME9rOzaG5sCEAmzY1vsGerCf1EUWvFWxiKqAufu3nN6PRVxJstHZ630zQBdWXg2ZOSbzvZvMqbo3fm64kPsRBfz2hDgWRsB4oUZUA1T/6CT1vNY1we6/iGlM+6vmzpZbBYsl9Pt6iYZoAGJgIqsRi/tYILNTFRYTLv+GKeEbQBtWvJMO3wwBN1EaKjz/93Kk3JO0swwAulnx760VaV5jBhtN14ipUfBCile3z+L1ZAFW08Nt3DOLG6U44lUptfW3vLZphwFbUwuzaYdxQr5/CDX5QqevElhfUj9JDZTGsL8Y0OEB6k7aRRyX48AM+eo/FlffeQm3p4VmQfW+2q7zB3EQVHFie68JhVNfq9s/zGVWHp5gFR5z9P1IDq/qbJLmjWuXhWnm+9uePlFXCVbwBxkvn4uQBebN1/VL/d64nVsdeP2RFH5b812xV7X5JG5do3evubUr37cEudhj6MB2SDtRr0MtQHnnp4u5/JoplULR6/WLW+XqtSDsW+2JuwO/2SI1WoB7Ukv/3tBTeiow== clean-portal-deployment" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo "✅ SSH key added successfully!"
```

### Step 3: Verify (Tell Me When Done)

Once you see "✅ SSH key added successfully!" in the terminal, **come back here and tell me "done"**.

I'll then:
1. Test the SSH connection locally
2. Update the GitHub secret
3. Trigger the deployment
4. Monitor it to completion

---

**Ready? Go to AWS Console and complete Steps 1-2, then tell me "done"!**


