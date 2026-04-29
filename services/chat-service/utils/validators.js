function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidRecordId(id) {
  return /^[a-f\d]{24}$/i.test(String(id));
}

module.exports = {
  isValidEmail,
  isValidRecordId,
};
