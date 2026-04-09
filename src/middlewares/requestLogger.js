function requestLogger(req, res, next) {
  console.log(`${req.method} ${req.url} - User: ${req.session?.user?.username || 'guest'}`);
  next();
}

module.exports = requestLogger;
