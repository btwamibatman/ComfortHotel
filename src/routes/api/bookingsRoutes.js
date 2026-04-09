const express = require('express');
const bookingsController = require('../../controllers/bookingsController');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');

const router = express.Router();

router.get('/', bookingsController.listBookings);
router.get('/:id', bookingsController.getBookingById);
router.post('/', isAuthenticated, bookingsController.createBooking);
router.put('/:id', isAdmin, bookingsController.updateBooking);
router.delete('/:id', isAdmin, bookingsController.deleteBooking);

module.exports = router;
