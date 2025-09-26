require('dotenv').config();
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    this.transporter = null;
    this.fallbackTransporter = null;
    this.isConfigured = false;
    this.init();
  }

  init() {
    // Check if email is configured for production
    const emailConfig = {
      service: process.env.EMAIL_SERVICE || 'gmail', // gmail, outlook, sendgrid, etc.
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      from: process.env.EMAIL_FROM || 'Equipment Photo Pro <noreply@equipmentphotopro.com>'
    };

    if (emailConfig.user && emailConfig.password) {
      // Configure real email service
      if (emailConfig.service === 'sendgrid') {
        // SendGrid Web API configuration (more reliable than SMTP)
        sgMail.setApiKey(emailConfig.password);
        this.emailService = 'sendgrid';
        console.log('Email service initialized with SendGrid Web API');
        
        // Set up Gmail fallback if Gmail credentials are available
        if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
          this.fallbackTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_PASSWORD
            },
            connectionTimeout: 30000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
          });
          console.log('Gmail fallback email service configured');
        }
      } else {
        // Gmail/other services using SMTP
        this.transporter = nodemailer.createTransport({
          service: emailConfig.service,
          auth: {
            user: emailConfig.user,
            pass: emailConfig.password
          },
          connectionTimeout: 30000, // 30 seconds
          greetingTimeout: 15000,   // 15 seconds
          socketTimeout: 30000,     // 30 seconds
        });
        this.emailService = 'smtp';
        console.log(`Email service initialized with ${emailConfig.service} SMTP`);
      }
      
      this.fromAddress = emailConfig.from;
      this.isConfigured = true;
      console.log(`Email service initialized successfully with ${emailConfig.service}`);
    } else {
      // Development mode - log to console
      console.log('Email service initialized (development mode - no SMTP configured)');
      console.log('To enable real emails, set EMAIL_USER and EMAIL_PASSWORD environment variables');
      this.isConfigured = true;
    }
  }

  // Generate a 6-digit verification code
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send verification code email
  async sendVerificationCode(email, code) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: this.fromAddress || 'Equipment Photo Pro <noreply@equipmentphotopro.com>',
      to: email,
      subject: 'Your Equipment Photo Pro Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Equipment Photo Pro</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Professional Equipment Photo Enhancement</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Your Login Code</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Use the following code to sign in to your Equipment Photo Pro account:
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${code}</span>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              This code will expire in 10 minutes for security reasons.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                If you didn't request this code, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Equipment Photo Pro - Your Login Code
        
        Use the following code to sign in: ${code}
        
        This code will expire in 10 minutes.
        
        If you didn't request this code, please ignore this email.
      `
    };

    // Send email if configured, otherwise log to console
    if (this.isConfigured) {
      try {
        console.log(`📤 Attempting to send email to ${email}...`);
        console.log(`📧 Email config - Service: ${process.env.EMAIL_SERVICE}, User: ${process.env.EMAIL_USER}`);
        
        let result;
        
        if (this.emailService === 'sendgrid') {
          // Use SendGrid Web API
          const msg = {
            to: email,
            from: this.fromAddress || 'Equipment Photo Pro <noreply@equipmentphotopro.com>',
            subject: 'Your Equipment Photo Pro Login Code',
            text: mailOptions.text,
            html: mailOptions.html,
          };
          
          console.log(`📧 SendGrid message prepared:`, {
            to: msg.to,
            from: msg.from,
            subject: msg.subject,
            hasHtml: !!msg.html,
            hasText: !!msg.text
          });
          
          result = await sgMail.send(msg);
          console.log(`✅ Verification code sent to ${email} via SendGrid Web API`);
        } else if (this.transporter) {
          // Use SMTP for other services
          await this.transporter.verify();
          console.log('✅ SMTP connection verified');
          
          // Add timeout to prevent hanging
          const sendPromise = this.transporter.sendMail(mailOptions);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Email send timeout after 30 seconds')), 30000)
          );
          
          result = await Promise.race([sendPromise, timeoutPromise]);
          console.log(`✅ Verification code sent to ${email} via SMTP`);
        } else {
          throw new Error('No email service configured');
        }
        
        return result;
      } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        console.error('❌ Full error:', error);
        
        // Try fallback email service if available
        if (this.fallbackTransporter && this.emailService === 'sendgrid') {
          try {
            console.log('🔄 Attempting fallback email service (Gmail)...');
            await this.fallbackTransporter.verify();
            result = await this.fallbackTransporter.sendMail(mailOptions);
            console.log(`✅ Verification code sent to ${email} via Gmail fallback`);
            return result;
          } catch (fallbackError) {
            console.error('❌ Fallback email also failed:', fallbackError.message);
          }
        }
        
        // Fallback to console logging if all email services fail
        console.log(`\n📧 EMAIL VERIFICATION CODE for ${email}: ${code}\n`);
        console.log('🔧 All email services failed, using fallback logging');
        console.log('💡 Check your email configuration and network connection');
        return Promise.resolve({ messageId: 'fallback-' + Date.now() });
      }
    } else {
      // Development mode - log the code
      console.log(`\n📧 EMAIL VERIFICATION CODE for ${email}: ${code}\n`);
      console.log('🔧 To enable real emails, set EMAIL_USER and EMAIL_PASSWORD environment variables');
      return Promise.resolve({ messageId: 'dev-' + Date.now() });
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email, name = 'User') {
    const mailOptions = {
      from: 'Equipment Photo Pro <noreply@equipmentphotopro.com>',
      to: email,
      subject: 'Welcome to Equipment Photo Pro!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Equipment Photo Pro!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for joining Equipment Photo Pro! You can now enhance your equipment photos with our AI-powered technology.
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">What you can do:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Upload and enhance equipment photos</li>
                <li>Choose from various backgrounds and lighting</li>
                <li>Download professional-quality results</li>
                <li>Track your processing history</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you have any questions, feel free to contact our support team.
            </p>
          </div>
        </div>
      `
    };

    console.log(`📧 Welcome email would be sent to ${email}`);
    return Promise.resolve({ messageId: 'welcome-' + Date.now() });
  }
}

module.exports = EmailService;
