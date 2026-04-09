const connectDB = require('../database/mongo');

async function findByUsername(username) {
  const db = await connectDB();
  return db.collection('users').findOne({ username });
}

module.exports = {
  findByUsername,
};
