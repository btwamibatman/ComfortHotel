function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
}

function validateContactInput({ name, email, message } = {}) {
  if (name == null || email == null || message == null) {
    return 'All fields are required';
  }

  if ([name, email, message].some((value) => typeof value !== 'string')) {
    return 'All fields must be strings';
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    return 'All fields are required';
  }

  if (!isValidEmail(trimmedEmail)) {
    return 'Invalid email format';
  }

  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return 'Name must be between 2 and 100 characters';
  }

  return null;
}

function isValidPhone(phone) {
  if (!phone) {
    return true;
  }

  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
}

function validateBookingDates(checkIn, checkOut) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    return { valid: false, error: 'Check-in date cannot be in the past' };
  }

  if (checkOutDate <= checkInDate) {
    return { valid: false, error: 'Check-out date must be after check-in date' };
  }

  return { valid: true };
}

function isValidRecordId(id) {
  return /^[a-f\d]{24}$/i.test(String(id));
}

module.exports = {
  isValidEmail,
  validateContactInput,
  isValidPhone,
  validateBookingDates,
  isValidRecordId,
};
