function isValidRecordId(value) {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
}

module.exports = {
  isValidRecordId,
};
