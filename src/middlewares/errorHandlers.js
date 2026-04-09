const path = require('path');
const { viewsDir } = require('../config/paths');

function apiNotFound(req, res) {
  res.status(404).json({ error: 'API endpoint not found' });
}

function notFound(req, res) {
  res.status(404).sendFile(path.join(viewsDir, '404.html'));
}

function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = {
  apiNotFound,
  notFound,
  errorHandler,
};
