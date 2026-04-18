const bookingsRepository = require('../repositories/bookingsRepository');
const { isValidEmail, isValidPhone, validateBookingDates } = require('../utils/validators');
const { buildListQuery } = require('../utils/query');
const ROOMS = require('../config/rooms');

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
    roomType,
    guestName,
    guestEmail,
    guestPhone,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    status,
  } = payload;

  if (!roomType || !guestName || !guestEmail || !checkInDate || !checkOutDate || !numberOfGuests) {
    return { error: 'Missing required fields' };
  }

  if (!ROOMS[roomType]) {
    return { error: 'Invalid room type' };
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

  if (Number.isNaN(guests) || guests < 1 || guests > 10) {
    return { error: 'Number of guests must be between 1 and 10' };
  }

  if (allowStatus && status && !VALID_STATUSES.includes(status)) {
    return { error: 'Invalid status' };
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  const roomConfig = ROOMS[roomType];
  const calculatedPrice = roomConfig.price * duration * guests;

  return {
    data: {
      roomName: roomConfig.name,
      roomType: roomType.trim(),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone ? guestPhone.trim() : '',
      checkInDate: checkIn,
      checkOutDate: checkOut,
      duration,
      numberOfGuests: guests,
      totalPrice: calculatedPrice,
      specialRequests: payload.specialRequests ? payload.specialRequests.trim() : '',
      ...(allowStatus && status ? { status } : {}),
    },
  };
}

async function checkAvailability(roomType, checkInDate, checkOutDate, excludeId = null) {
  const overlapCount = await bookingsRepository.countOverlappingBookings(roomType, checkInDate, checkOutDate, excludeId);
  return overlapCount < ROOMS[roomType].count;
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
  checkAvailability,
  createBooking,
  updateBooking,
  deleteBooking,
};
