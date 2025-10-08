# Fix SSH Key via AWS Console (2 minutes)

## Why This Method?
- SSM agent isn't running on the EC2 instance
- EC2 Instance Connect timing out too quickly via CLI
- AWS Console EC2 Instance Connect has a longer timeout window

## Steps

### 1. Open AWS Console
Go to: https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#Instances:instanceId=i-05efc928b83a2e0ab

### 2. Click "Connect" Button
- Click the orange "Connect" button at the top
- Select "EC2 Instance Connect" tab
- Leave "User name" as `ubuntu`
- Click "Connect" button

### 3. In the Browser Terminal, Paste This
```bash
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC/OgLJ0r3SGmVLpns3ItMNvablf3W8ViwZkZl8w6ptLuq5dYHXNELQv7o3FODYtdWfbC+KRGGnempmOsOgv3z+ncTF9QlLyzRgJGrXCXHq6UZcwi3EnIYullVIJ8yZf4O0CC6kUUz1MHZveFZlN7ZTZMME9rOzaG5sCEAmzY1vsGerCf1EUWvFWxiKqAufu3nN6PRVxJstHZ630zQBdWXg2ZOSbzvZvMqbo3fm64kPsRBfz2hDgWRsB4oUZUA1T/6CT1vNY1we6/iGlM+6vmzpZbBYsl9Pt6iYZoAGJgIqsRi/tYILNTFRYTLv+GKeEbQBtWvJMO3wwBN1EaKjz/93Kk3JO0swwAulnx760VaV5jBhtN14ipUfBCile3z+L1ZAFW08Nt3DOLG6U44lUptfW3vLZphwFbUwuzaYdxQr5/CDX5QqevElhfUj9JDZTGsL8Y0OEB6k7aRRyX48AM+eo/FlffeQm3p4VmQfW+2q7zB3EQVHFie68JhVNfq9s/zGVWHp5gFR5z9P1IDq/qbJLmjWuXhWnm+9uePlFXCVbwBxkvn4uQBebN1/VL/d64nVsdeP2RFH5b812xV7X5JG5do3evubUr37cEudhj6MB2SDtRr0MtQHnnp4u5/JoplULR6/WLW+XqtSDsW+2JuwO/2SI1WoB7Ukv/3tBTeiow== clean-portal-deployment" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo "✅ SSH key added successfully!"
```

### 4. Verify You See This
```
✅ SSH key added successfully!
```

### 5. Come Back Here and Type "done"

Once you type "done" in our chat, I'll:
1. Test the SSH connection
2. Update GitHub secret
3. Trigger deployment
4. Watch it complete

---

**Ready? Open the AWS Console and complete steps 1-4!**


