const { MongoClient } = require('mongodb');
const config = require('../config/env');

const client = new MongoClient(config.mongoUri);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(config.mongoDbName);
  }

  return db;
}

module.exports = connectDB;
