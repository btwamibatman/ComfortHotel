const { query } = require('../database/postgres');
const {
  writeResultFromInsert,
  writeResultFromUpdate,
  writeResultFromDelete,
  applyProjection,
  buildOrderBy,
} = require('./sqlHelpers');

const SORT_COLUMNS = {
  _id: 'id',
  name: 'name',
  email: 'email',
  created_at: 'created_at',
  updated_at: 'updated_at',
};

function mapContact(row) {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    source: row.source,
    created_at: row.created_at,
    created_by: row.created_by,
    updated_at: row.updated_at,
    updated_by: row.updated_by,
  };
}

async function listContacts({ filter, sort, projection }) {
  const conditions = [];
  const params = [];

  if (filter.email) {
    params.push(filter.email);
    conditions.push(`email = $${params.length}`);
  }
  if (filter.name) {
    params.push(filter.name);
    conditions.push(`name = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = buildOrderBy(sort, SORT_COLUMNS, 'created_at');
  const result = await query(`SELECT * FROM contacts ${where} ORDER BY ${orderBy}`, params);
  return applyProjection(result.rows.map(mapContact), projection);
}

async function getContactById(id) {
  const result = await query('SELECT * FROM contacts WHERE id = $1 LIMIT 1', [id]);
  return mapContact(result.rows[0]);
}

async function createContact(payload) {
  const result = await query(
    `INSERT INTO contacts (name, email, message, source, created_at, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      payload.name,
      payload.email,
      payload.message,
      payload.source,
      payload.created_at || new Date(),
      payload.created_by,
    ]
  );
  return writeResultFromInsert(result.rows[0]);
}

async function updateContact(id, payload) {
  const result = await query(
    `UPDATE contacts
     SET name = $2,
         email = $3,
         message = $4,
         updated_at = $5,
         updated_by = $6
     WHERE id = $1`,
    [id, payload.name, payload.email, payload.message, payload.updated_at, payload.updated_by]
  );
  return writeResultFromUpdate(result.rowCount);
}

async function deleteContact(id) {
  const result = await query('DELETE FROM contacts WHERE id = $1', [id]);
  return writeResultFromDelete(result.rowCount);
}

module.exports = {
  listContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
