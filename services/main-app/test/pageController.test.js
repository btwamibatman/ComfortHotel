const test = require('node:test');
const assert = require('node:assert/strict');

const config = require('../src/config/env');
const { listRoomsForView } = require('../src/controllers/pageController');

test.beforeEach(() => {
  config.productServiceUrl = 'http://product-service:3000';
});

test('returns rooms from the configured product service', async () => {
  const rooms = [{ id: 1, name: 'Standard' }];
  let requestedUrl;
  let requestedSignal;

  const result = await listRoomsForView({
    fetchFn: async (url, options) => {
      requestedUrl = url;
      requestedSignal = options.signal;
      return { ok: true, json: async () => rooms };
    },
    timeoutMs: 50,
  });

  assert.deepEqual(result, rooms);
  assert.equal(requestedUrl, 'http://product-service:3000/api/rooms');
  assert.equal(requestedSignal.aborted, false);
});

test('preserves product-service status errors', async () => {
  await assert.rejects(
    listRoomsForView({
      fetchFn: async () => ({ ok: false, status: 503 }),
      timeoutMs: 50,
    }),
    /Product service returned 503/,
  );
});

test('aborts a stalled product-service request', async () => {
  let requestedSignal;
  const fetchFn = (_url, { signal }) => new Promise((_resolve, reject) => {
    requestedSignal = signal;
    signal.addEventListener('abort', () => reject(new Error('request aborted')), {
      once: true,
    });
  });

  await assert.rejects(
    listRoomsForView({ fetchFn, timeoutMs: 5 }),
    /request aborted/,
  );
  assert.equal(requestedSignal.aborted, true);
});
