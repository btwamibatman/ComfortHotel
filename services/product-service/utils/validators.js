function isValidRecordId(value) {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
}

function validateRoomInput(payload) {
  const { type, name, price, count } = payload || {};

  if (typeof type !== 'string' || !type.trim()
      || typeof name !== 'string' || !name.trim()
      || price === undefined || count === undefined) {
    return { error: 'Missing required fields' };
  }

  const isNumericInput = (value) => typeof value === 'number'
    || (typeof value === 'string' && value.trim() !== '');
  const numericPrice = Number(price);
  const numericCount = Number(count);

  if (!isNumericInput(price) || !Number.isFinite(numericPrice) || numericPrice < 0) {
    return { error: 'Price must be a non-negative finite number' };
  }

  if (!isNumericInput(count) || !Number.isSafeInteger(numericCount) || numericCount < 0) {
    return { error: 'Count must be a non-negative integer' };
  }

  return {
    data: {
      type: type.trim().toLowerCase(),
      name: name.trim(),
      price: numericPrice,
      count: numericCount,
    },
  };
}

module.exports = {
  isValidRecordId,
  validateRoomInput,
};
