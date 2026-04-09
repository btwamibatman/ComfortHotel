const express = require('express');
const contactsRoutes = require('./contactsRoutes');
const bookingsRoutes = require('./bookingsRoutes');
const infoController = require('../../controllers/infoController');

const router = express.Router();

router.get('/info', infoController.getApiInfo);
router.use('/contacts', contactsRoutes);
router.use('/bookings', bookingsRoutes);

module.exports = router;
