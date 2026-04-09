require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('./src/database/mongo');

async function initializeUsers() {
  try {
    const db = await connectDB();
    const usersCollection = db.collection('users');

    const existingUsers = await usersCollection.countDocuments();
    if (existingUsers > 0) {
      console.log('Users already exist in database. Skipping initialization.');
      console.log(`Found ${existingUsers} user(s).`);
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
      await usersCollection.insertOne({
        username: user.username,
        password: hashedPassword,
        role: user.role,
        email: user.email,
        fullName: user.fullName,
        created_at: new Date(),
      });
    }

    console.log('User initialization completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing users:', error);
    process.exit(1);
  }
}

initializeUsers();
