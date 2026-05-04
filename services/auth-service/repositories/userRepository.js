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

async function upsertUser(userData) {
  const result = await query(
    `INSERT INTO users (username, password, role, email, full_name)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (username) DO UPDATE
     SET password = EXCLUDED.password,
         role = EXCLUDED.role,
         email = EXCLUDED.email,
         full_name = EXCLUDED.full_name,
         updated_at = now()
     RETURNING *`,
    [
      userData.username,
      userData.password,
      userData.role,
      userData.email,
      userData.fullName,
    ]
  );
  return mapUser(result.rows[0]);
}

module.exports = {
  findByUsername,
  upsertUser,
};
