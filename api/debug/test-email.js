// Vercel serverless function for testing email
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    const testEmail = email || 'test@example.com';
    
    console.log(`🧪 Testing email send to: ${testEmail}`);
    
    if (process.env.EMAIL_SERVICE === 'sendgrid' && process.env.EMAIL_PASSWORD) {
      sgMail.setApiKey(process.env.EMAIL_PASSWORD);
      
      const msg = {
        to: testEmail,
        from: process.env.EMAIL_FROM || 'test@example.com',
        subject: 'Test Email from Equipment Photo Pro',
        text: 'This is a test email to verify email functionality',
        html: '<p>This is a test email to verify email functionality</p>'
      };
      
      const result = await sgMail.send(msg);
      
      res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        statusCode: result[0].statusCode,
        messageId: result[0].headers['x-message-id'] || 'N/A',
        testEmail: testEmail
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'SendGrid not configured properly',
        environment: {
          EMAIL_SERVICE: process.env.EMAIL_SERVICE,
          EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '***masked***' : 'NOT SET'
        }
      });
    }
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code || 'N/A'
    });
  }
}
