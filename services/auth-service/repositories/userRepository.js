const { query } = require('../database/postgres');

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    username: row.username,
    password: row.password,
    role: row.role,
    email: row.email,
    fullName: row.full_name,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function findByUsername(username) {
  const result = await query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
  return mapUser(result.rows[0]);
}

module.exports = {
  findByUsername,
};
