const DatabaseService = require('./services/database');

async function setupAdmin() {
  const db = new DatabaseService();
  
  try {
    await db.init();
    
    // You'll need to replace this with your actual admin email
    const adminEmail = process.argv[2] || 'admin@equipmentphotopro.com';
    
    console.log(`Setting up admin user: ${adminEmail}`);
    
    // Check if user already exists
    const existingUser = await db.getUserByEmail(adminEmail);
    
    if (existingUser) {
      // Update existing user to be admin
      await new Promise((resolve, reject) => {
        db.db.run(
          'UPDATE users SET is_admin = TRUE WHERE email = ?',
          [adminEmail],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      console.log(`✅ Updated existing user ${adminEmail} to admin`);
    } else {
      // Create new admin user
      await new Promise((resolve, reject) => {
        db.db.run(
          'INSERT INTO users (email, is_admin) VALUES (?, TRUE)',
          [adminEmail],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      console.log(`✅ Created new admin user: ${adminEmail}`);
    }
    
    console.log('\n🎉 Admin setup complete!');
    console.log('You can now log in with this email address.');
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  } finally {
    db.close();
  }
}

// Run if called directly
if (require.main === module) {
  setupAdmin();
}

module.exports = setupAdmin;
