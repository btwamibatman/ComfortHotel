const roomsService = require('../services/roomsService');
const { isValidRecordId } = require('../utils/validators');
const logger = require('../utils/logger');

async function listRooms(req, res) {
  try {
    const rooms = await roomsService.listRooms();
    return res.status(200).json(rooms);
  } catch (error) {
    logger.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function getRoomById(req, res) {
  if (!isValidRecordId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const room = await roomsService.getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    return res.status(200).json(room);
  } catch (error) {
    logger.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function createRoom(req, res) {
  const validation = roomsService.validateRoomInput(req.body);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const result = await roomsService.createRoom(validation.data);
    return res.status(201).json({
      message: 'Room created successfully',
      id: result.insertedId,
    });
  } catch (error) {
    if (error.message === 'Room type already exists') {
      return res.status(400).json({ error: error.message });
    }
    logger.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function updateRoom(req, res) {
  if (!isValidRecordId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const validation = roomsService.validateRoomInput(req.body);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const result = await roomsService.updateRoom(req.params.id, validation.data);
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    const updatedRoom = await roomsService.getRoomById(req.params.id);
    return res.status(200).json(updatedRoom);
  } catch (error) {
    if (error.message === 'Room type already exists for another room') {
      return res.status(400).json({ error: error.message });
    }
    logger.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function deleteRoom(req, res) {
  if (!isValidRecordId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const result = await roomsService.deleteRoom(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    return res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    logger.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

module.exports = {
  listRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
