const test = require('node:test');
const assert = require('node:assert/strict');

const productClient = require('../clients/productClient');
const { validateBookingInput } = require('../services/bookingsService');

const validPayload = {
  roomType: 'standard',
  guestName: 'Test Guest',
  guestEmail: 'guest@example.com',
  guestPhone: '+7 700 000 00 00',
  checkInDate: '2999-01-01',
  checkOutDate: '2999-01-02',
  numberOfGuests: 2,
  specialRequests: 'Late arrival',
};

test('public booking endpoint returns 400 for a missing body', async (t) => {
  const app = require('../app');
  const server = await new Promise((resolve) => {
    const listeningServer = app.listen(0, () => resolve(listeningServer));
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/bookings/public`, {
    method: 'POST',
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Missing required fields' });
});

test('rejects a missing request body without contacting product-service', async (t) => {
  const roomLookup = t.mock.method(productClient, 'getRoomByType', async () => {
    throw new Error('product-service must not be called');
  });

  assert.deepEqual(await validateBookingInput(undefined), {
    error: 'Missing required fields',
  });
  assert.equal(roomLookup.mock.callCount(), 0);
});

test('rejects non-string required fields before room lookup', async (t) => {
  const roomLookup = t.mock.method(productClient, 'getRoomByType', async () => {
    throw new Error('product-service must not be called');
  });

  assert.deepEqual(await validateBookingInput({ ...validPayload, guestName: 123 }), {
    error: 'Missing required fields',
  });
  assert.equal(roomLookup.mock.callCount(), 0);
});

test('rejects non-string optional text fields without throwing', async (t) => {
  const roomLookup = t.mock.method(productClient, 'getRoomByType', async () => {
    throw new Error('product-service must not be called');
  });

  assert.deepEqual(await validateBookingInput({ ...validPayload, specialRequests: {} }), {
    error: 'Invalid special requests format',
  });
  assert.equal(roomLookup.mock.callCount(), 0);
});

test('rejects guest counts with trailing text instead of partially parsing them', async (t) => {
  const roomLookup = t.mock.method(productClient, 'getRoomByType', async () => {
    throw new Error('product-service must not be called');
  });

  assert.deepEqual(await validateBookingInput({ ...validPayload, numberOfGuests: '2 guests' }), {
    error: 'Number of guests must be between 1 and 10',
  });
  assert.equal(roomLookup.mock.callCount(), 0);
});

test('rejects fractional guest counts', async (t) => {
  const roomLookup = t.mock.method(productClient, 'getRoomByType', async () => {
    throw new Error('product-service must not be called');
  });

  assert.deepEqual(await validateBookingInput({ ...validPayload, numberOfGuests: 2.5 }), {
    error: 'Number of guests must be between 1 and 10',
  });
  assert.equal(roomLookup.mock.callCount(), 0);
});

test('rejects non-numeric guest count types without throwing', async (t) => {
  const roomLookup = t.mock.method(productClient, 'getRoomByType', async () => {
    throw new Error('product-service must not be called');
  });

  assert.deepEqual(await validateBookingInput({ ...validPayload, numberOfGuests: true }), {
    error: 'Number of guests must be between 1 and 10',
  });
  assert.equal(roomLookup.mock.callCount(), 0);
});

test('accepts a numeric form string and normalizes text fields', async (t) => {
  t.mock.method(productClient, 'getRoomByType', async () => ({
    name: 'Standard Room',
    price: 100,
    count: 3,
  }));

  const result = await validateBookingInput({
    ...validPayload,
    roomType: ' standard ',
    guestName: ' Test Guest ',
    guestEmail: ' GUEST@EXAMPLE.COM ',
    numberOfGuests: '2',
  });

  assert.equal(result.error, undefined);
  assert.deepEqual(
    {
      roomType: result.data.roomType,
      guestName: result.data.guestName,
      guestEmail: result.data.guestEmail,
      numberOfGuests: result.data.numberOfGuests,
    },
    {
      roomType: 'standard',
      guestName: 'Test Guest',
      guestEmail: 'guest@example.com',
      numberOfGuests: 2,
    }
  );
});
