const { ObjectId } = require('mongodb');
const connectDB = require('../database/mongo');

async function listContacts({ filter, sort, projection }) {
  const db = await connectDB();
  let cursor = db.collection('contacts').find(filter).sort(sort);
  if (projection) {
    cursor = cursor.project(projection);
  }
  return cursor.toArray();
}

async function getContactById(id) {
  const db = await connectDB();
  return db.collection('contacts').findOne({ _id: new ObjectId(id) });
}

async function createContact(payload) {
  const db = await connectDB();
  return db.collection('contacts').insertOne(payload);
}

async function updateContact(id, payload) {
  const db = await connectDB();
  return db.collection('contacts').updateOne({ _id: new ObjectId(id) }, { $set: payload });
}

async function deleteContact(id) {
  const db = await connectDB();
  return db.collection('contacts').deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
  listContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
