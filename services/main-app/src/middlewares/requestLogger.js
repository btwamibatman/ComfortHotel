const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const user = req.session?.user?.username || 'guest';
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms - User: ${user}`);
  });

  next();
}

module.exports = requestLogger;
