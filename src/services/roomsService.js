const roomsRepository = require('../repositories/roomsRepository');

function validateRoomInput(payload) {
  const { type, name, price, count } = payload;

  if (!type || !name || price === undefined || count === undefined) {
    return { error: 'Missing required fields' };
  }

  const numericPrice = Number(price);
  const numericCount = Number(count);

  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    return { error: 'Price must be a positive number' };
  }

  if (Number.isNaN(numericCount) || numericCount < 0) {
    return { error: 'Count must be a positive integer' };
  }

  return {
    data: {
      type: type.trim().toLowerCase(),
      name: name.trim(),
      price: numericPrice,
      count: Math.floor(numericCount),
    },
  };
}

async function listRooms() {
  return roomsRepository.listRooms();
}

async function getRoomById(id) {
  return roomsRepository.getRoomById(id);
}

async function getRoomByType(type) {
  return roomsRepository.getRoomByType(type);
}

async function createRoom(roomData) {
  const existing = await roomsRepository.getRoomByType(roomData.type);
  if (existing) {
    throw new Error('Room type already exists');
  }
  return roomsRepository.createRoom(roomData);
}

async function updateRoom(id, roomData) {
  const existing = await roomsRepository.getRoomByType(roomData.type);
  if (existing && existing._id.toString() !== id) {
    throw new Error('Room type already exists for another room');
  }
  return roomsRepository.updateRoom(id, roomData);
}

async function deleteRoom(id) {
  return roomsRepository.deleteRoom(id);
}

async function initializeDefaultRooms() {
  const rooms = await listRooms();
  if (rooms.length === 0) {
    const defaultRooms = [
      { type: 'single', name: 'Single Room', price: 50, count: 5 },
      { type: 'double', name: 'Double Room', price: 90, count: 3 },
      { type: 'suite', name: 'Luxury Suite', price: 150, count: 2 },
    ];
    
    for (const room of defaultRooms) {
      await roomsRepository.createRoom(room);
    }
    return true; // Initialized
  }
  return false; // Already has data
}

module.exports = {
  validateRoomInput,
  listRooms,
  getRoomById,
  getRoomByType,
  createRoom,
  updateRoom,
  deleteRoom,
  initializeDefaultRooms,
};
