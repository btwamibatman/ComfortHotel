const { Pool } = require('pg');
const config = require('../config/env');

const pool = new Pool({
  connectionString: config.databaseUrl,
});

async function connectDB() {
  await pool.query('SELECT 1');
  return pool;
}

module.exports = connectDB;
module.exports.pool = pool;
module.exports.query = (text, params) => pool.query(text, params);
module.exports.close = () => pool.end();
