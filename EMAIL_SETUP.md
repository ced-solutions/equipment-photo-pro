# 📧 Email Setup Guide for Equipment Photo Pro

## Current Status
By default, the system runs in **development mode** and logs verification codes to the console instead of sending real emails.

## 🔧 Setting Up Real Email Service

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Add to your `.env` file**:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_character_app_password
   EMAIL_FROM=Equipment Photo Pro <your_email@gmail.com>
   ```

### Option 2: Outlook/Hotmail

1. **Add to your `.env` file**:
   ```env
   EMAIL_SERVICE=hotmail
   EMAIL_USER=your_email@outlook.com
   EMAIL_PASSWORD=your_outlook_password
   EMAIL_FROM=Equipment Photo Pro <your_email@outlook.com>
   ```

### Option 3: SendGrid (Recommended for Production)

1. **Create a SendGrid account** at https://sendgrid.com
2. **Generate an API key** in SendGrid dashboard
3. **Add to your `.env` file**:
   ```env
   EMAIL_SERVICE=sendgrid
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your_sendgrid_api_key
   EMAIL_FROM=Equipment Photo Pro <noreply@yourdomain.com>
   ```

### Option 4: SendGrid with Gmail Fallback (Most Reliable)

For maximum reliability, you can configure SendGrid as primary with Gmail as fallback:

1. **Set up SendGrid** (as above)
2. **Set up Gmail** (as in Option 1)
3. **Add to your `.env` file**:
   ```env
   EMAIL_SERVICE=sendgrid
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your_sendgrid_api_key
   EMAIL_FROM=Equipment Photo Pro <noreply@yourdomain.com>
   
   # Gmail fallback (optional)
   GMAIL_USER=your_email@gmail.com
   GMAIL_PASSWORD=your_gmail_app_password
   ```

## 🚀 Production Setup (Render)

For production deployment on Render, add these environment variables in your Render dashboard:

**Option A: SendGrid (Recommended)**
```
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=Equipment Photo Pro <noreply@yourdomain.com>
```

**Option B: Gmail**
```
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Equipment Photo Pro <your_email@gmail.com>
```

**Option C: SendGrid with Gmail Fallback (Most Reliable)**
```
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=Equipment Photo Pro <noreply@yourdomain.com>
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_gmail_app_password
```

## 🔍 How to Check Current Status

**Development Mode (Console Logging):**
```
📧 EMAIL VERIFICATION CODE for user@example.com: 123456
🔧 To enable real emails, set EMAIL_USER and EMAIL_PASSWORD environment variables
```

**Production Mode (Real Emails):**
```
✅ Verification code sent to user@example.com
```

## 🧪 Testing Email Setup

1. **Set up your `.env` file** with email credentials
2. **Restart your server**: `npm run server`
3. **Try logging in** with any email address
4. **Check your email** for the verification code
5. **Check server logs** for success/error messages

## 🔒 Security Notes

- **Never commit** your `.env` file to git
- **Use App Passwords** for Gmail (not your regular password)
- **Consider SendGrid** for production (more reliable than personal email)
- **Rate limiting** is built-in (10-minute expiration for codes)

## 📞 Troubleshooting

**"Failed to send verification email"**
- Check your email credentials in `.env`
- For Gmail: Make sure you're using an App Password, not your regular password
- Check your internet connection

**"Email service not configured"**
- Make sure you have EMAIL_USER and EMAIL_PASSWORD in your `.env` file
- Restart the server after adding email configuration

**Codes not arriving**
- Check spam/junk folder
- Verify email address is correct
- Check server logs for error messages
