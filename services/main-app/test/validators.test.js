const test = require('node:test');
const assert = require('node:assert/strict');

const { validateContactInput } = require('../src/utils/validators');

test('accepts trimmed contact details', () => {
  assert.equal(validateContactInput({
    name: '  Ada Lovelace  ',
    email: '  ada@example.com  ',
    message: '  I would like more information.  ',
  }), null);
});

test('rejects blank contact details', () => {
  assert.equal(validateContactInput({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: '   ',
  }), 'All fields are required');
});

test('rejects non-string contact details without throwing', () => {
  assert.equal(validateContactInput({
    name: { value: 'Ada Lovelace' },
    email: 'ada@example.com',
    message: 'Hello',
  }), 'All fields must be strings');
});

test('rejects a missing request body without throwing', () => {
  assert.equal(validateContactInput(), 'All fields are required');
});
