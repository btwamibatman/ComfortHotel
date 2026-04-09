const bookingsRepository = require('../repositories/bookingsRepository');
const { isValidEmail, isValidPhone, validateBookingDates } = require('../utils/validators');
const { buildListQuery } = require('../utils/query');

const VALID_STATUSES = ['pending', 'confirmed', 'checked-in', 'completed', 'cancelled'];

async function listBookings(query) {
  const filter = {};
  if (query.roomName) {
    filter.roomName = query.roomName;
  }
  if (query.guestEmail) {
    filter.guestEmail = query.guestEmail;
  }
  if (query.status) {
    filter.status = query.status;
  }

  const { sort, projection } = buildListQuery(query, 'checkInDate');
  return bookingsRepository.listBookings({ filter, sort, projection });
}

async function getBookingById(id) {
  return bookingsRepository.getBookingById(id);
}

function validateBookingInput(payload, { allowStatus = false } = {}) {
  const {
    roomName,
    roomType,
    guestName,
    guestEmail,
    guestPhone,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    totalPrice,
    status,
  } = payload;

  if (!roomName || !roomType || !guestName || !guestEmail || !checkInDate || !checkOutDate || !numberOfGuests || !totalPrice) {
    return { error: 'Missing required fields' };
  }

  if (!isValidEmail(guestEmail)) {
    return { error: 'Invalid email format' };
  }

  if (guestPhone && !isValidPhone(guestPhone)) {
    return { error: 'Invalid phone format' };
  }

  const dateValidation = validateBookingDates(checkInDate, checkOutDate);
  if (!dateValidation.valid) {
    return { error: dateValidation.error };
  }

  const guests = parseInt(numberOfGuests, 10);
  const price = parseFloat(totalPrice);

  if (Number.isNaN(guests) || guests < 1 || guests > 10) {
    return { error: 'Number of guests must be between 1 and 10' };
  }

  if (Number.isNaN(price) || price < 0) {
    return { error: 'Invalid price' };
  }

  if (allowStatus && status && !VALID_STATUSES.includes(status)) {
    return { error: 'Invalid status' };
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  return {
    data: {
      roomName: roomName.trim(),
      roomType: roomType.trim(),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone ? guestPhone.trim() : '',
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      duration,
      numberOfGuests: guests,
      totalPrice: price,
      specialRequests: payload.specialRequests ? payload.specialRequests.trim() : '',
      ...(allowStatus && status ? { status } : {}),
    },
  };
}

async function createBooking(payload) {
  return bookingsRepository.createBooking(payload);
}

async function updateBooking(id, payload) {
  return bookingsRepository.updateBooking(id, payload);
}

async function deleteBooking(id) {
  return bookingsRepository.deleteBooking(id);
}

module.exports = {
  listBookings,
  getBookingById,
  validateBookingInput,
  createBooking,
  updateBooking,
  deleteBooking,
};
