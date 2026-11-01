function establishAuthenticatedSession(req, user, callback) {
  if (!req.session || typeof req.session.regenerate !== 'function') {
    callback(new Error('Session is unavailable'));
    return;
  }

  req.session.regenerate((regenerateError) => {
    if (regenerateError) {
      callback(regenerateError);
      return;
    }

    req.session.user = user;
    req.session.save(callback);
  });
}

module.exports = {
  establishAuthenticatedSession,
};
