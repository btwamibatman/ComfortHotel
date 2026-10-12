const test = require('node:test');
const assert = require('node:assert/strict');

const { validateBookingDates } = require('../utils/validators');

const FUTURE_CHECK_IN = '2999-01-01';
const FUTURE_CHECK_OUT = '2999-01-02';

test('rejects an invalid check-in date', () => {
  assert.deepEqual(validateBookingDates('not-a-date', FUTURE_CHECK_OUT), {
    valid: false,
    error: 'Invalid check-in or check-out date',
  });
});

test('rejects an invalid check-out date', () => {
  assert.deepEqual(validateBookingDates(FUTURE_CHECK_IN, 'not-a-date'), {
    valid: false,
    error: 'Invalid check-in or check-out date',
  });
});

test('accepts a valid future stay', () => {
  assert.deepEqual(validateBookingDates(FUTURE_CHECK_IN, FUTURE_CHECK_OUT), {
    valid: true,
  });
});

test('rejects check-out dates that are not after check-in', () => {
  assert.deepEqual(validateBookingDates(FUTURE_CHECK_IN, FUTURE_CHECK_IN), {
    valid: false,
    error: 'Check-out date must be after check-in date',
  });
});
