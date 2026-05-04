const logger = require('../utils/logger');

function apiNotFound(req, res) {
  res.status(404).json({ error: 'API endpoint not found' });
}

function notFound(req, res) {
  res.status(404).render('404', { activePage: '' });
}

function errorHandler(err, req, res, next) {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = {
  apiNotFound,
  notFound,
  errorHandler,
};
