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

    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await usersCollection.insertOne({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: adminPassword,
      role: 'admin',
      email: 'admin@comforthoetel.com',
      fullName: 'Administrator',
      created_at: new Date(),
    });

    const managerPassword = await bcrypt.hash('manager123', 10);
    await usersCollection.insertOne({
      username: 'manager',
      password: managerPassword,
      role: 'manager',
      email: 'manager@comforthoetel.com',
      fullName: 'Hotel Manager',
      created_at: new Date(),
    });

    console.log('User initialization completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing users:', error);
    process.exit(1);
  }
}

initializeUsers();
