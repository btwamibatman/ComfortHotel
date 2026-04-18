const connectDB = require('../database/mongo');
const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'rooms';

async function listRooms() {
  const db = await connectDB();
  return db.collection(COLLECTION_NAME).find({}).toArray();
}

async function getRoomById(id) {
  const db = await connectDB();
  return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
}

async function getRoomByType(type) {
  const db = await connectDB();
  return db.collection(COLLECTION_NAME).findOne({ type });
}

async function createRoom(roomData) {
  const db = await connectDB();
  return db.collection(COLLECTION_NAME).insertOne(roomData);
}

async function updateRoom(id, roomData) {
  const db = await connectDB();
  return db.collection(COLLECTION_NAME).updateOne(
    { _id: new ObjectId(id) },
    { $set: roomData }
  );
}

async function deleteRoom(id) {
  const db = await connectDB();
  return db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
  listRooms,
  getRoomById,
  getRoomByType,
  createRoom,
  updateRoom,
  deleteRoom,
};
