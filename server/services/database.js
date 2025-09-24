const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseService {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, '../database/equipment_photo_pro.db');
  }

  async init() {
    return new Promise((resolve, reject) => {
      // Ensure database directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const schema = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        images_processed_count INTEGER DEFAULT 0,
        is_admin BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'active',
        trial_started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        trial_images_used INTEGER DEFAULT 0,
        subscription_status VARCHAR(20) DEFAULT 'trial'
      );

      -- Sessions table for authentication
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Auth codes table for email verification
      CREATE TABLE IF NOT EXISTS auth_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        used_at DATETIME
      );

      -- Image processing history
      CREATE TABLE IF NOT EXISTS processing_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_size INTEGER,
        processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processing_time_ms INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_auth_codes_email ON auth_codes(email);
      CREATE INDEX IF NOT EXISTS idx_auth_codes_code ON auth_codes(code);
      CREATE INDEX IF NOT EXISTS idx_processing_history_user ON processing_history(user_id);
    `;

    return new Promise((resolve, reject) => {
      this.db.exec(schema, (err) => {
        if (err) {
          console.error('Error creating tables:', err);
          reject(err);
        } else {
          console.log('Database tables created successfully');
          resolve();
        }
      });
    });
  }

  // User management methods
  async createUser(email) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO users (email) VALUES (?)';
      this.db.run(sql, [email], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, email });
        }
      });
    });
  }

  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      this.db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getUserById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id = ?';
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async updateUserLastLogin(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
      this.db.run(sql, [userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async incrementImageCount(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET images_processed_count = images_processed_count + 1, trial_images_used = trial_images_used + 1 WHERE id = ?';
      this.db.run(sql, [userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async checkTrialLimits(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          trial_started_at, 
          trial_images_used, 
          subscription_status,
          is_admin,
          created_at
        FROM users 
        WHERE id = ?
      `;
      this.db.get(sql, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async updateSubscriptionStatus(userId, status) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET subscription_status = ? WHERE id = ?';
      this.db.run(sql, [status, userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Session management methods
  async createSession(userId, token, expiresAt) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)';
      this.db.run(sql, [userId, token, expiresAt], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getSession(token) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT s.*, u.email, u.is_admin, u.images_processed_count 
        FROM sessions s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.session_token = ? AND s.expires_at > CURRENT_TIMESTAMP
      `;
      this.db.get(sql, [token], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async deleteSession(token) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM sessions WHERE session_token = ?';
      this.db.run(sql, [token], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async cleanupExpiredSessions() {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP';
      this.db.run(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Auth code management methods
  async createAuthCode(email, code, expiresAt) {
    // First, invalidate any existing codes for this email
    await this.invalidateAuthCodes(email);
    
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO auth_codes (email, code, expires_at) VALUES (?, ?, ?)';
      console.log(`💾 Storing auth code - email: ${email}, code: ${code}, expires: ${expiresAt}`);
      this.db.run(sql, [email, code, expiresAt], function(err) {
        if (err) {
          console.log('❌ Error storing auth code:', err);
          reject(err);
        } else {
          console.log(`✅ Auth code stored with ID: ${this.lastID}`);
          resolve();
        }
      });
    });
  }

  async validateAuthCode(email, code) {
    return new Promise((resolve, reject) => {
      const currentTime = new Date().toISOString();
      const sql = `
        SELECT * FROM auth_codes 
        WHERE email = ? AND code = ? AND expires_at > ? AND used = FALSE
      `;
      console.log(`🔍 Database validation - email: ${email}, code: ${code}`);
      console.log(`⏰ Current time for comparison: ${currentTime}`);
      this.db.get(sql, [email, code, currentTime], (err, row) => {
        if (err) {
          console.log('❌ Database error:', err);
          reject(err);
        } else {
          console.log('📊 Database result:', row ? 'Found valid code' : 'No valid code found');
          if (row) {
            console.log(`⏰ Code expires at: ${row.expires_at}, Current time: ${currentTime}`);
          }
          resolve(row);
        }
      });
    });
  }

  async markAuthCodeAsUsed(email, code) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE auth_codes SET used = TRUE, used_at = datetime(\'now\') WHERE email = ? AND code = ?';
      this.db.run(sql, [email, code], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async invalidateAuthCodes(email) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE auth_codes SET used = TRUE WHERE email = ? AND used = FALSE';
      this.db.run(sql, [email], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Admin methods
  async getAllUsers() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, email, created_at, last_login, images_processed_count, is_admin, status 
        FROM users 
        ORDER BY created_at DESC
      `;
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getTotalStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_users,
          SUM(images_processed_count) as total_images_processed,
          COUNT(CASE WHEN last_login > datetime('now', '-30 days') THEN 1 END) as active_users_30_days
        FROM users 
        WHERE status = 'active'
      `;
      this.db.get(sql, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async addProcessingRecord(userId, filename, originalSize, processingTime) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO processing_history (user_id, filename, original_size, processing_time_ms) VALUES (?, ?, ?, ?)';
      this.db.run(sql, [userId, filename, originalSize, processingTime], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getProcessingHistory(userId, limit = 50) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM processing_history 
        WHERE user_id = ? 
        ORDER BY processed_at DESC 
        LIMIT ?
      `;
      this.db.all(sql, [userId, limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = DatabaseService;
