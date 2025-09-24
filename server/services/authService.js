const crypto = require('crypto');
const DatabaseService = require('./database');
const EmailService = require('./emailService');

class AuthService {
  constructor() {
    this.db = new DatabaseService();
    this.emailService = new EmailService();
  }

  async init() {
    await this.db.init();
  }

  // Generate a secure session token
  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Send login code to email
  async sendLoginCode(email) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Generate verification code
      const code = this.emailService.generateVerificationCode();
      
      // Set expiration time (10 minutes from now)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Store the code in database
      await this.db.createAuthCode(email.toLowerCase(), code, expiresAt);

      // Send email
      await this.emailService.sendVerificationCode(email.toLowerCase(), code);

      return {
        success: true,
        message: 'Verification code sent to your email',
        expiresIn: 10 * 60 * 1000 // 10 minutes in milliseconds
      };
    } catch (error) {
      console.error('Error sending login code:', error);
      throw new Error('Failed to send verification code');
    }
  }

  // Verify login code and create session
  async verifyLoginCode(email, code) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Validate code format (6 digits)
      if (!/^\d{6}$/.test(code)) {
        throw new Error('Invalid code format');
      }

      const normalizedEmail = email.toLowerCase();

      // Verify the code
      const authCode = await this.db.validateAuthCode(normalizedEmail, code);
      if (!authCode) {
        throw new Error('Invalid or expired verification code');
      }

      // Mark code as used
      await this.db.markAuthCodeAsUsed(normalizedEmail, code);

      // Get or create user
      let user = await this.db.getUserByEmail(normalizedEmail);
      if (!user) {
        user = await this.db.createUser(normalizedEmail);
        // Send welcome email for new users
        try {
          await this.emailService.sendWelcomeEmail(normalizedEmail);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the login for email issues
        }
      }

      // Update last login
      await this.db.updateUserLastLogin(user.id);

      // Create session
      const sessionToken = this.generateSessionToken();
      const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await this.db.createSession(user.id, sessionToken, sessionExpiresAt);

      return {
        success: true,
        message: 'Login successful',
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          imagesProcessedCount: user.images_processed_count,
          isAdmin: user.is_admin,
          createdAt: user.created_at
        },
        expiresAt: sessionExpiresAt
      };
    } catch (error) {
      console.error('Error verifying login code:', error);
      throw error;
    }
  }

  // Verify session token
  async verifySession(sessionToken) {
    try {
      if (!sessionToken) {
        throw new Error('No session token provided');
      }

      const session = await this.db.getSession(sessionToken);
      if (!session) {
        throw new Error('Invalid or expired session');
      }

      return {
        success: true,
        user: {
          id: session.user_id,
          email: session.email,
          imagesProcessedCount: session.images_processed_count,
          isAdmin: session.is_admin
        }
      };
    } catch (error) {
      console.error('Error verifying session:', error);
      throw error;
    }
  }

  // Logout user
  async logout(sessionToken) {
    try {
      if (sessionToken) {
        await this.db.deleteSession(sessionToken);
      }
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // Middleware for protecting routes
  async requireAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'Please log in to access this feature'
        });
      }

      const sessionToken = authHeader.substring(7);
      const authResult = await this.verifySession(sessionToken);
      
      req.user = authResult.user;
      next();
    } catch (error) {
      return res.status(401).json({ 
        error: 'Invalid session',
        message: 'Please log in again'
      });
    }
  }

  // Middleware for admin routes
  async requireAdmin(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'Admin access required'
        });
      }

      const sessionToken = authHeader.substring(7);
      const authResult = await this.verifySession(sessionToken);
      
      if (!authResult.user.isAdmin) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'Admin privileges required'
        });
      }

      req.user = authResult.user;
      next();
    } catch (error) {
      return res.status(401).json({ 
        error: 'Invalid session',
        message: 'Please log in again'
      });
    }
  }

  // Track image processing
  async trackImageProcessing(userId, filename, originalSize, processingTime) {
    try {
      // Add to processing history
      await this.db.addProcessingRecord(userId, filename, originalSize, processingTime);
      
      // Increment user's image count
      await this.db.incrementImageCount(userId);
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking image processing:', error);
      throw error;
    }
  }

  // Get user stats
  async getUserStats(userId) {
    try {
      const user = await this.db.getUserById(userId);
      const processingHistory = await this.db.getProcessingHistory(userId, 20);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          imagesProcessedCount: user.images_processed_count,
          createdAt: user.created_at,
          lastLogin: user.last_login
        },
        recentProcessing: processingHistory
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Get admin stats
  async getAdminStats() {
    try {
      const totalStats = await this.db.getTotalStats();
      const allUsers = await this.db.getAllUsers();
      
      return {
        totalUsers: totalStats.total_users,
        totalImagesProcessed: totalStats.total_images_processed,
        activeUsers30Days: totalStats.active_users_30_days,
        users: allUsers
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      throw error;
    }
  }

  // Cleanup expired sessions and codes
  async cleanup() {
    try {
      await this.db.cleanupExpiredSessions();
      console.log('Cleaned up expired sessions');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  close() {
    this.db.close();
  }
}

module.exports = AuthService;
