const { pool, query } = require('../database/postgres');
const {
  writeResultFromInsert,
  writeResultFromUpdate,
  writeResultFromDelete,
  applyProjection,
  buildOrderBy,
} = require('./sqlHelpers');

const SORT_COLUMNS = {
  _id: 'id',
  roomName: 'room_name',
  roomType: 'room_type',
  guestName: 'guest_name',
  guestEmail: 'guest_email',
  checkInDate: 'check_in_date',
  checkOutDate: 'check_out_date',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at',
};

function mapBooking(row) {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    roomName: row.room_name,
    roomType: row.room_type,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    guestPhone: row.guest_phone,
    checkInDate: row.check_in_date,
    checkOutDate: row.check_out_date,
    duration: row.duration,
    numberOfGuests: row.number_of_guests,
    totalPrice: Number(row.total_price),
    specialRequests: row.special_requests,
    status: row.status,
    created_at: row.created_at,
    created_by: row.created_by,
    updated_at: row.updated_at,
    updated_by: row.updated_by,
  };
}

async function listBookings({ filter, sort, projection }) {
  const conditions = [];
  const params = [];

  if (filter.roomName) {
    params.push(filter.roomName);
    conditions.push(`room_name = $${params.length}`);
  }
  if (filter.guestEmail) {
    params.push(filter.guestEmail);
    conditions.push(`guest_email = $${params.length}`);
  }
  if (filter.status) {
    params.push(filter.status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = buildOrderBy(sort, SORT_COLUMNS, 'checkInDate');
  const result = await query(`SELECT * FROM bookings ${where} ORDER BY ${orderBy}`, params);
  return applyProjection(result.rows.map(mapBooking), projection);
}

async function getBookingById(id) {
  const result = await query('SELECT * FROM bookings WHERE id = $1 LIMIT 1', [id]);
  return mapBooking(result.rows[0]);
}

async function createBooking(payload) {
  const result = await query(
    `INSERT INTO bookings (
       room_name, room_type, guest_name, guest_email, guest_phone,
       check_in_date, check_out_date, duration, number_of_guests,
       total_price, special_requests, status, created_at, created_by
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id`,
    [
      payload.roomName,
      payload.roomType,
      payload.guestName,
      payload.guestEmail,
      payload.guestPhone || '',
      payload.checkInDate,
      payload.checkOutDate,
      payload.duration,
      payload.numberOfGuests,
      payload.totalPrice,
      payload.specialRequests || '',
      payload.status,
      payload.created_at || new Date(),
      payload.created_by,
    ]
  );
  return writeResultFromInsert(result.rows[0]);
}

async function insertBooking(client, payload) {
  const result = await client.query(
    `INSERT INTO bookings (
       room_name, room_type, guest_name, guest_email, guest_phone,
       check_in_date, check_out_date, duration, number_of_guests,
       total_price, special_requests, status, created_at, created_by
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id`,
    [
      payload.roomName,
      payload.roomType,
      payload.guestName,
      payload.guestEmail,
      payload.guestPhone || '',
      payload.checkInDate,
      payload.checkOutDate,
      payload.duration,
      payload.numberOfGuests,
      payload.totalPrice,
      payload.specialRequests || '',
      payload.status,
      payload.created_at || new Date(),
      payload.created_by,
    ]
  );
  return writeResultFromInsert(result.rows[0]);
}

async function updateBooking(id, payload) {
  const result = await query(
    `UPDATE bookings
     SET room_name = COALESCE($2, room_name),
         room_type = COALESCE($3, room_type),
         guest_name = COALESCE($4, guest_name),
         guest_email = COALESCE($5, guest_email),
         guest_phone = COALESCE($6, guest_phone),
         check_in_date = COALESCE($7, check_in_date),
         check_out_date = COALESCE($8, check_out_date),
         duration = COALESCE($9, duration),
         number_of_guests = COALESCE($10, number_of_guests),
         total_price = COALESCE($11, total_price),
         special_requests = COALESCE($12, special_requests),
         status = COALESCE($13, status),
         updated_at = COALESCE($14, updated_at),
         updated_by = COALESCE($15, updated_by)
     WHERE id = $1`,
    [
      id,
      payload.roomName,
      payload.roomType,
      payload.guestName,
      payload.guestEmail,
      payload.guestPhone,
      payload.checkInDate,
      payload.checkOutDate,
      payload.duration,
      payload.numberOfGuests,
      payload.totalPrice,
      payload.specialRequests,
      payload.status,
      payload.updated_at,
      payload.updated_by,
    ]
  );
  return writeResultFromUpdate(result.rowCount);
}

async function updateBookingWithClient(client, id, payload) {
  const result = await client.query(
    `UPDATE bookings
     SET room_name = COALESCE($2, room_name),
         room_type = COALESCE($3, room_type),
         guest_name = COALESCE($4, guest_name),
         guest_email = COALESCE($5, guest_email),
         guest_phone = COALESCE($6, guest_phone),
         check_in_date = COALESCE($7, check_in_date),
         check_out_date = COALESCE($8, check_out_date),
         duration = COALESCE($9, duration),
         number_of_guests = COALESCE($10, number_of_guests),
         total_price = COALESCE($11, total_price),
         special_requests = COALESCE($12, special_requests),
         status = COALESCE($13, status),
         updated_at = COALESCE($14, updated_at),
         updated_by = COALESCE($15, updated_by)
     WHERE id = $1`,
    [
      id,
      payload.roomName,
      payload.roomType,
      payload.guestName,
      payload.guestEmail,
      payload.guestPhone,
      payload.checkInDate,
      payload.checkOutDate,
      payload.duration,
      payload.numberOfGuests,
      payload.totalPrice,
      payload.specialRequests,
      payload.status,
      payload.updated_at,
      payload.updated_by,
    ]
  );
  return writeResultFromUpdate(result.rowCount);
}

async function deleteBooking(id) {
  const result = await query('DELETE FROM bookings WHERE id = $1', [id]);
  return writeResultFromDelete(result.rowCount);
}

async function countOverlappingBookingsWithClient(client, roomType, checkIn, checkOut, excludeId = null) {
  const params = [roomType, checkOut, checkIn];
  let excludeClause = '';
  if (excludeId) {
    params.push(excludeId);
    excludeClause = `AND id <> $${params.length}`;
  }

  const result = await client.query(
    `SELECT COUNT(*)::int AS count
     FROM bookings
     WHERE room_type = $1
       AND status <> 'cancelled'
       AND check_in_date < $2
       AND check_out_date > $3
       ${excludeClause}`,
    params
  );
  return result.rows[0].count;
}

async function countOverlappingBookings(roomType, checkIn, checkOut, excludeId = null) {
  const params = [roomType, checkOut, checkIn];
  let excludeClause = '';
  if (excludeId) {
    params.push(excludeId);
    excludeClause = `AND id <> $${params.length}`;
  }

  const result = await query(
    `SELECT COUNT(*)::int AS count
     FROM bookings
     WHERE room_type = $1
       AND status <> 'cancelled'
       AND check_in_date < $2
       AND check_out_date > $3
       ${excludeClause}`,
    params
  );
  return result.rows[0].count;
}

async function createBookingIfAvailable(payload, roomCount) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [payload.roomType]);

    const overlapCount = await countOverlappingBookingsWithClient(
      client,
      payload.roomType,
      payload.checkInDate,
      payload.checkOutDate
    );

    if (overlapCount >= roomCount) {
      await client.query('ROLLBACK');
      return { unavailable: true };
    }

    const result = await insertBooking(client, payload);
    await client.query('COMMIT');
    return { unavailable: false, ...result };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateBookingIfAvailable(id, payload, roomCount) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM bookings WHERE id = $1 FOR UPDATE', [id]);
    if (existing.rowCount === 0) {
      await client.query('ROLLBACK');
      return { unavailable: false, matchedCount: 0, modifiedCount: 0 };
    }

    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [payload.roomType]);

    const overlapCount = await countOverlappingBookingsWithClient(
      client,
      payload.roomType,
      payload.checkInDate,
      payload.checkOutDate,
      id
    );

    if (overlapCount >= roomCount) {
      await client.query('ROLLBACK');
      return { unavailable: true };
    }

    const result = await updateBookingWithClient(client, id, payload);
    await client.query('COMMIT');
    return { unavailable: false, ...result };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  listBookings,
  getBookingById,
  createBooking,
  createBookingIfAvailable,
  updateBooking,
  updateBookingIfAvailable,
  deleteBooking,
  countOverlappingBookings,
};
