const express = require('express');
const contactsRoutes = require('./contactsRoutes');
const bookingsRoutes = require('./bookingsRoutes');
const roomsRoutes = require('./roomsRoutes');
const infoController = require('../../controllers/infoController');

const router = express.Router();

router.get('/info', infoController.getApiInfo);
router.use('/contacts', contactsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/rooms', roomsRoutes);

module.exports = router;
