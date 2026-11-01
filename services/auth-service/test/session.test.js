const test = require('node:test');
const assert = require('node:assert/strict');

const { establishAuthenticatedSession } = require('../utils/session');

test('regenerates the session before storing and saving the authenticated user', () => {
  const events = [];
  const user = { id: '42', username: 'admin', role: 'admin' };
  const req = {
    session: {
      regenerate(callback) {
        events.push('regenerate');
        req.session = {
          save(saveCallback) {
            events.push('save');
            saveCallback();
          },
        };
        callback();
      },
    },
  };

  establishAuthenticatedSession(req, user, (error) => {
    assert.equal(error, undefined);
    events.push('complete');
  });

  assert.deepEqual(events, ['regenerate', 'save', 'complete']);
  assert.equal(req.session.user, user);
});

test('does not store the user when session regeneration fails', () => {
  const expectedError = new Error('regeneration failed');
  let saveCalled = false;
  const req = {
    session: {
      regenerate(callback) {
        callback(expectedError);
      },
      save() {
        saveCalled = true;
      },
    },
  };

  establishAuthenticatedSession(req, { id: '42' }, (error) => {
    assert.equal(error, expectedError);
  });

  assert.equal(req.session.user, undefined);
  assert.equal(saveCalled, false);
});

test('propagates session save failures', () => {
  const expectedError = new Error('save failed');
  const req = {
    session: {
      regenerate(callback) {
        req.session = {
          save(saveCallback) {
            saveCallback(expectedError);
          },
        };
        callback();
      },
    },
  };

  establishAuthenticatedSession(req, { id: '42' }, (error) => {
    assert.equal(error, expectedError);
  });
});

test('reports a controlled error when the session is unavailable', () => {
  establishAuthenticatedSession({}, { id: '42' }, (error) => {
    assert.match(error.message, /unavailable/);
  });
});
