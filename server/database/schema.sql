-- Equipment Photo Pro Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    images_processed_count INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' -- active, suspended, deleted
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_codes_email ON auth_codes(email);
CREATE INDEX IF NOT EXISTS idx_auth_codes_code ON auth_codes(code);
CREATE INDEX IF NOT EXISTS idx_processing_history_user ON processing_history(user_id);

-- Insert admin user (you'll need to set this up manually)
-- INSERT INTO users (email, is_admin) VALUES ('your-admin-email@example.com', TRUE);
