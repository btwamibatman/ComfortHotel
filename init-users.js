require('dotenv').config();
const bcrypt = require('bcrypt');
const { query, close } = require('./src/database/postgres');

async function initializeUsers() {
  try {
    const countResult = await query('SELECT COUNT(*)::int AS count FROM users');
    const existingUsers = countResult.rows[0].count;
    if (existingUsers > 0) {
      console.log('Users already exist in database. Skipping initialization.');
      console.log(`Found ${existingUsers} user(s).`);
      await close();
      process.exit(0);
    }

    console.log('Creating users with hashed passwords...');

    const requiredEnvKeys = [
      'ADMIN_USERNAME',
      'ADMIN_PASSWORD',
      'ADMIN_EMAIL',
      'ADMIN_FULL_NAME',
      'MANAGER_USERNAME',
      'MANAGER_PASSWORD',
      'MANAGER_EMAIL',
      'MANAGER_FULL_NAME',
    ];

    const missingKeys = requiredEnvKeys.filter((key) => !process.env[key]);
    if (missingKeys.length > 0) {
      throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
    }

    const usersToCreate = [
      {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
        email: process.env.ADMIN_EMAIL,
        fullName: process.env.ADMIN_FULL_NAME,
      },
      {
        username: process.env.MANAGER_USERNAME,
        password: process.env.MANAGER_PASSWORD,
        role: 'manager',
        email: process.env.MANAGER_EMAIL,
        fullName: process.env.MANAGER_FULL_NAME,
      },
    ];

    if (process.env.USER_USERNAME && process.env.USER_PASSWORD) {
      usersToCreate.push({
        username: process.env.USER_USERNAME,
        password: process.env.USER_PASSWORD,
        role: 'user',
        email: process.env.USER_EMAIL || `${process.env.USER_USERNAME}@comforthotel.local`,
        fullName: process.env.USER_FULL_NAME || process.env.USER_USERNAME,
      });
    }

    for (const user of usersToCreate) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await query(
        `INSERT INTO users (username, password, role, email, full_name, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.username, hashedPassword, user.role, user.email, user.fullName, new Date()]
      );
    }

    console.log('User initialization completed successfully.');
    await close();
    process.exit(0);
  } catch (error) {
    console.error('Error initializing users:', error);
    await close();
    process.exit(1);
  }
}

initializeUsers();
