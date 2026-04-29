const { query } = require('../database/postgres');
const {
  writeResultFromInsert,
  writeResultFromUpdate,
  writeResultFromDelete,
} = require('./sqlHelpers');

function mapRoom(row) {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    type: row.type,
    name: row.name,
    price: Number(row.price),
    count: row.count,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function listRooms() {
  const result = await query('SELECT * FROM rooms ORDER BY name ASC');
  return result.rows.map(mapRoom);
}

async function getRoomById(id) {
  const result = await query('SELECT * FROM rooms WHERE id = $1 LIMIT 1', [id]);
  return mapRoom(result.rows[0]);
}

async function getRoomByType(type) {
  const result = await query('SELECT * FROM rooms WHERE type = $1 LIMIT 1', [type]);
  return mapRoom(result.rows[0]);
}

async function createRoom(roomData) {
  const result = await query(
    `INSERT INTO rooms (type, name, price, count)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [roomData.type, roomData.name, roomData.price, roomData.count]
  );
  return writeResultFromInsert(result.rows[0]);
}

async function updateRoom(id, roomData) {
  const result = await query(
    `UPDATE rooms
     SET type = $2, name = $3, price = $4, count = $5, updated_at = now()
     WHERE id = $1`,
    [id, roomData.type, roomData.name, roomData.price, roomData.count]
  );
  return writeResultFromUpdate(result.rowCount);
}

async function deleteRoom(id) {
  const result = await query('DELETE FROM rooms WHERE id = $1', [id]);
  return writeResultFromDelete(result.rowCount);
}

module.exports = {
  listRooms,
  getRoomById,
  getRoomByType,
  createRoom,
  updateRoom,
  deleteRoom,
};
