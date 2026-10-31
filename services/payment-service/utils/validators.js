function validatePaymentInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'bookingId is required' };
  }

  const { bookingId, amount, currency = 'USD' } = input;
  if (typeof bookingId !== 'string' || !bookingId.trim()) {
    return { error: 'bookingId is required' };
  }

  const amountIsSupported = (
    typeof amount === 'number'
    || (typeof amount === 'string' && amount.trim() !== '')
  );
  const numericAmount = amountIsSupported ? Number(amount) : NaN;
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return { error: 'amount must be a positive number' };
  }

  if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)) {
    return { error: 'currency must be a 3-letter ISO code' };
  }

  return {
    value: {
      bookingId: bookingId.trim(),
      amount: numericAmount,
      currency,
    },
  };
}

module.exports = {
  validatePaymentInput,
};
