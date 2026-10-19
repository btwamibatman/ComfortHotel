const assert = require('node:assert/strict');
const test = require('node:test');
const { validateRoomInput } = require('../utils/validators');

const room = { type: 'single', name: 'Single Room', price: 50, count: 5 };

test('normalizes valid form values without rounding inventory', () => {
  assert.deepEqual(validateRoomInput({
    type: ' SINGLE ', name: ' Single Room ', price: '50.25', count: '5',
  }), { data: { ...room, price: 50.25 } });
});

test('accepts zero price and inventory', () => {
  assert.deepEqual(validateRoomInput({ ...room, price: 0, count: 0 }), {
    data: { ...room, price: 0, count: 0 },
  });
});

test('rejects non-finite, negative and non-numeric prices', () => {
  for (const price of [Infinity, -Infinity, NaN, 'Infinity', '1e309', -1, null, true, '', [], {}]) {
    assert.ok(validateRoomInput({ ...room, price }).error, `price: ${String(price)}`);
  }
});

test('rejects fractional, unsafe and invalid inventory counts', () => {
  for (const count of [1.5, '2.5', Infinity, '1e309', NaN, -1, Number.MAX_SAFE_INTEGER + 1, null, false, '', []]) {
    assert.ok(validateRoomInput({ ...room, count }).error, `count: ${String(count)}`);
  }
});

test('rejects missing or non-string names and types without throwing', () => {
  for (const value of [null, undefined, '', '   ', 42, {}, []]) {
    assert.ok(validateRoomInput({ ...room, type: value }).error);
    assert.ok(validateRoomInput({ ...room, name: value }).error);
  }
  assert.ok(validateRoomInput(null).error);
  assert.ok(validateRoomInput(undefined).error);
});
