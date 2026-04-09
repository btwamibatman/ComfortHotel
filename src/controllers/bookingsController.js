const bookingsService = require('../services/bookingsService');
const { isValidObjectId } = require('../utils/validators');

async function listBookings(req, res) {
  try {
    const bookings = await bookingsService.listBookings(req.query);
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function getBookingById(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const booking = await bookingsService.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function createBooking(req, res) {
  const validation = bookingsService.validateBookingInput(req.body);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const result = await bookingsService.createBooking({
      ...validation.data,
      status: 'pending',
      created_at: new Date(),
      created_by: req.session.user.username,
    });

    return res.status(201).json({
      message: 'Booking created successfully',
      id: result.insertedId,
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function updateBooking(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const validation = bookingsService.validateBookingInput(req.body, { allowStatus: true });
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const result = await bookingsService.updateBooking(req.params.id, {
      ...validation.data,
      updated_at: new Date(),
      updated_by: req.session.user.username,
    });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updatedBooking = await bookingsService.getBookingById(req.params.id);
    return res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function deleteBooking(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const result = await bookingsService.deleteBooking(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

module.exports = {
  listBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
};
