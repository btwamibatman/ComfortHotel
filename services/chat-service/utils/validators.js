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

function isValidRecordId(id) {
  return /^[a-f\d]{24}$/i.test(String(id));
}

module.exports = {
  isValidEmail,
  validateContactInput,
  isValidRecordId,
};
