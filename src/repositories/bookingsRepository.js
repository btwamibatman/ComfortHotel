const { ObjectId } = require('mongodb');
const connectDB = require('../database/mongo');

async function listBookings({ filter, sort, projection }) {
  const db = await connectDB();
  let cursor = db.collection('bookings').find(filter).sort(sort);
  if (projection) {
    cursor = cursor.project(projection);
  }
  return cursor.toArray();
}

async function getBookingById(id) {
  const db = await connectDB();
  return db.collection('bookings').findOne({ _id: new ObjectId(id) });
}

async function createBooking(payload) {
  const db = await connectDB();
  return db.collection('bookings').insertOne(payload);
}

async function updateBooking(id, payload) {
  const db = await connectDB();
  return db.collection('bookings').updateOne({ _id: new ObjectId(id) }, { $set: payload });
}

async function deleteBooking(id) {
  const db = await connectDB();
  return db.collection('bookings').deleteOne({ _id: new ObjectId(id) });
}

async function countOverlappingBookings(roomType, checkIn, checkOut, excludeId = null) {
  const db = await connectDB();
  const filter = {
    roomType: roomType,
    status: { $ne: 'cancelled' },
    $and: [
      { checkInDate: { $lt: checkOut } },
      { checkOutDate: { $gt: checkIn } }
    ]
  };
  
  if (excludeId) {
    filter._id = { $ne: new ObjectId(excludeId) };
  }

  return db.collection('bookings').countDocuments(filter);
}

module.exports = {
  listBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  countOverlappingBookings,
};
