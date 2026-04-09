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

module.exports = {
  listBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
};
