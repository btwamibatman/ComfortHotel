const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const test = require('node:test');

const { dockerRequest, positiveInteger } = require('../server');

function requestTransport({ chunks = [], statusCode = 200, stalled = false } = {}) {
  return (_options, onResponse) => {
    const request = new EventEmitter();
    let timeoutHandler;
    request.setTimeout = (_timeoutMs, handler) => {
      timeoutHandler = handler;
    };
    request.destroy = (error) => queueMicrotask(() => request.emit('error', error));
    request.end = () => {
      if (stalled) {
        queueMicrotask(() => timeoutHandler());
        return;
      }
      const response = new EventEmitter();
      response.statusCode = statusCode;
      response.setEncoding = () => {};
      response.destroy = () => {};
      onResponse(response);
      queueMicrotask(() => {
        for (const chunk of chunks) {
          response.emit('data', chunk);
        }
        response.emit('end');
      });
    };
    return request;
  };
}

test('dockerRequest parses a bounded JSON response', async () => {
  const result = await dockerRequest('/containers/json', {
    timeoutMs: 1000,
    maxResponseBytes: 1024,
    requestFn: requestTransport({
      chunks: [JSON.stringify([{ Id: 'container-1' }])],
    }),
  });

  assert.deepEqual(result, [{ Id: 'container-1' }]);
});

test('dockerRequest aborts a stalled Docker API response', async () => {
  await assert.rejects(
    dockerRequest('/containers/json', {
      timeoutMs: 25,
      maxResponseBytes: 1024,
      requestFn: requestTransport({ stalled: true }),
    }),
    /timed out after 25ms/
  );
});

test('dockerRequest rejects a response above the byte limit', async () => {
  await assert.rejects(
    dockerRequest('/containers/json', {
      timeoutMs: 1000,
      maxResponseBytes: 64,
      requestFn: requestTransport({
        chunks: [JSON.stringify({ payload: 'x'.repeat(256) })],
      }),
    }),
    /response exceeded 64 bytes/
  );
});

test('positiveInteger falls back for unsafe request limits', () => {
  assert.equal(positiveInteger('2500', 5000), 2500);
  assert.equal(positiveInteger('0', 5000), 5000);
  assert.equal(positiveInteger('not-a-number', 5000), 5000);
});
