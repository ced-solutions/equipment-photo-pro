// Vercel serverless function for email debugging
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

export default async function handler(req, res) {
  try {
    const debugInfo = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        EMAIL_SERVICE: process.env.EMAIL_SERVICE,
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '***masked***' : 'NOT SET',
        EMAIL_FROM: process.env.EMAIL_FROM,
        GMAIL_USER: process.env.GMAIL_USER,
        GMAIL_PASSWORD: process.env.GMAIL_PASSWORD ? '***masked***' : 'NOT SET'
      },
      packages: {
        sendgridAvailable: false,
        nodemailerAvailable: false
      }
    };

    // Test package availability
    try {
      require('@sendgrid/mail');
      debugInfo.packages.sendgridAvailable = true;
    } catch (e) {
      debugInfo.packages.sendgridAvailable = false;
    }

    try {
      require('nodemailer');
      debugInfo.packages.nodemailerAvailable = true;
    } catch (e) {
      debugInfo.packages.nodemailerAvailable = false;
    }

    // Test SendGrid API if configured
    if (process.env.EMAIL_SERVICE === 'sendgrid' && process.env.EMAIL_PASSWORD) {
      try {
        sgMail.setApiKey(process.env.EMAIL_PASSWORD);
        
        const testMsg = {
          to: 'test@example.com',
          from: process.env.EMAIL_FROM || 'test@example.com',
          subject: 'Debug Test',
          text: 'Debug test from Vercel'
        };
        
        const result = await sgMail.send(testMsg);
        debugInfo.sendgridTest = {
          success: true,
          statusCode: result[0].statusCode,
          messageId: result[0].headers['x-message-id'] || 'N/A'
        };
      } catch (error) {
        debugInfo.sendgridTest = {
          success: false,
          error: error.message,
          code: error.code || 'N/A'
        };
      }
    }

    res.status(200).json(debugInfo);
  } catch (error) {
    res.status(500).json({ 
      error: 'Debug failed', 
      message: error.message,
      stack: error.stack 
    });
  }
}
