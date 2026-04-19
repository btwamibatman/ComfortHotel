const express = require('express');
const roomsController = require('../../controllers/roomsController');
const { isAdmin } = require('../../middlewares/auth');

const router = express.Router();

router.get('/', roomsController.listRooms);
router.get('/:id', roomsController.getRoomById);

// Protect write operations with isAdmin middleware
router.post('/', isAdmin, roomsController.createRoom);
router.put('/:id', isAdmin, roomsController.updateRoom);
router.delete('/:id', isAdmin, roomsController.deleteRoom);

module.exports = router;
