const test = require('node:test');
const assert = require('node:assert/strict');

const { validatePaymentInput } = require('../utils/validators');

test('normalizes a valid payment request', () => {
  assert.deepEqual(validatePaymentInput({
    bookingId: '  booking-42  ',
    amount: '125.50',
  }), {
    value: {
      bookingId: 'booking-42',
      amount: 125.5,
      currency: 'USD',
    },
  });
});

test('rejects a missing request body without throwing', () => {
  assert.deepEqual(validatePaymentInput(), { error: 'bookingId is required' });
});

test('rejects blank booking identifiers', () => {
  assert.deepEqual(validatePaymentInput({ bookingId: '   ', amount: 10 }), {
    error: 'bookingId is required',
  });
});

test('rejects arrays, objects and blank strings as amounts', () => {
  for (const amount of [[10], { value: 10 }, '', '   ', true]) {
    assert.deepEqual(validatePaymentInput({ bookingId: 'booking-42', amount }), {
      error: 'amount must be a positive number',
    });
  }
});

test('rejects non-positive and non-finite amounts', () => {
  for (const amount of [0, -1, Infinity, 'Infinity']) {
    assert.deepEqual(validatePaymentInput({ bookingId: 'booking-42', amount }), {
      error: 'amount must be a positive number',
    });
  }
});

test('rejects malformed currency values', () => {
  for (const currency of ['usd', 'US', ['USD'], null]) {
    assert.deepEqual(validatePaymentInput({ bookingId: 'booking-42', amount: 10, currency }), {
      error: 'currency must be a 3-letter ISO code',
    });
  }
});
