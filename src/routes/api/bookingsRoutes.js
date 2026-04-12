const express = require('express');
const bookingsController = require('../../controllers/bookingsController');
const { isInternalStaff, isAdmin } = require('../../middlewares/auth');

const router = express.Router();

router.post('/public', bookingsController.createPublicBooking);
router.get('/', isInternalStaff, bookingsController.listBookings);
router.get('/:id', isInternalStaff, bookingsController.getBookingById);
router.post('/', isInternalStaff, bookingsController.createBooking);
router.put('/:id', isAdmin, bookingsController.updateBooking);
router.delete('/:id', isAdmin, bookingsController.deleteBooking);

module.exports = router;
