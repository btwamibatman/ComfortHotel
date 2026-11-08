const bookingsRepository = require('../repositories/bookingsRepository');
const { isValidEmail, isValidPhone, validateBookingDates } = require('../utils/validators');
const { buildListQuery } = require('../utils/query');
const productClient = require('../clients/productClient');

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

async function validateBookingInput(payload, { allowStatus = false } = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { error: 'Missing required fields' };
  }

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

  const requiredTextFields = [roomType, guestName, guestEmail, checkInDate, checkOutDate];
  if (
    requiredTextFields.some((value) => typeof value !== 'string' || !value.trim())
    || numberOfGuests === undefined
    || numberOfGuests === null
    || (typeof numberOfGuests === 'string' && !numberOfGuests.trim())
  ) {
    return { error: 'Missing required fields' };
  }

  if (guestPhone !== undefined && guestPhone !== null && typeof guestPhone !== 'string') {
    return { error: 'Invalid phone format' };
  }

  if (
    payload.specialRequests !== undefined
    && payload.specialRequests !== null
    && typeof payload.specialRequests !== 'string'
  ) {
    return { error: 'Invalid special requests format' };
  }

  const normalizedRoomType = roomType.trim();
  const normalizedEmail = guestEmail.trim().toLowerCase();
  const normalizedPhone = guestPhone ? guestPhone.trim() : '';
  const normalizedCheckIn = checkInDate.trim();
  const normalizedCheckOut = checkOutDate.trim();

  if (!isValidEmail(normalizedEmail)) {
    return { error: 'Invalid email format' };
  }

  if (normalizedPhone && !isValidPhone(normalizedPhone)) {
    return { error: 'Invalid phone format' };
  }

  const dateValidation = validateBookingDates(normalizedCheckIn, normalizedCheckOut);
  if (!dateValidation.valid) {
    return { error: dateValidation.error };
  }

  let guests = Number.NaN;
  if (typeof numberOfGuests === 'number') {
    guests = numberOfGuests;
  } else if (typeof numberOfGuests === 'string' && /^\d+$/.test(numberOfGuests.trim())) {
    guests = Number(numberOfGuests.trim());
  }

  if (!Number.isSafeInteger(guests) || guests < 1 || guests > 10) {
    return { error: 'Number of guests must be between 1 and 10' };
  }

  if (allowStatus && status && !VALID_STATUSES.includes(status)) {
    return { error: 'Invalid status' };
  }

  const roomConfig = await productClient.getRoomByType(normalizedRoomType);
  if (!roomConfig) {
    return { error: 'Invalid room type' };
  }

  const checkIn = new Date(normalizedCheckIn);
  const checkOut = new Date(normalizedCheckOut);
  const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const calculatedPrice = roomConfig.price * duration * guests;

  return {
    roomConfig,
    data: {
      roomName: roomConfig.name,
      roomType: normalizedRoomType,
      guestName: guestName.trim(),
      guestEmail: normalizedEmail,
      guestPhone: normalizedPhone,
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

async function checkAvailability(roomType, checkInDate, checkOutDate, excludeBookingId = null) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  const overlapCount = await bookingsRepository.countOverlappingBookings(
    roomType,
    checkIn,
    checkOut,
    excludeBookingId
  );

  const roomConfig = await productClient.getRoomByType(roomType);
  if (!roomConfig) {
    return false;
  }

  return overlapCount < roomConfig.count;
}

async function createBooking(payload, roomCount) {
  return bookingsRepository.createBookingIfAvailable(payload, roomCount);
}

async function updateBooking(id, payload, roomCount) {
  return bookingsRepository.updateBookingIfAvailable(id, payload, roomCount);
}

function validateStatusTransition(currentStatus, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    return { valid: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` };
  }

  const allowedTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['checked-in', 'cancelled'],
    'checked-in': ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  const allowed = allowedTransitions[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      error: `Cannot change status from '${currentStatus}' to '${newStatus}'. Allowed: ${allowed.join(', ') || 'none (final state)'}`,
    };
  }

  return { valid: true };
}

async function updateBookingStatus(id, newStatus, updatedBy) {
  const booking = await bookingsRepository.getBookingById(id);
  if (!booking) {
    return { error: 'Booking not found', statusCode: 404 };
  }

  const transition = validateStatusTransition(booking.status, newStatus);
  if (!transition.valid) {
    return { error: transition.error, statusCode: 400 };
  }

  await bookingsRepository.updateBooking(id, {
    status: newStatus,
    updated_at: new Date(),
    updated_by: updatedBy,
  });

  return { success: true, booking: await bookingsRepository.getBookingById(id) };
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
  updateBookingStatus,
  deleteBooking,
};
