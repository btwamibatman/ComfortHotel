const express = require('express');
const client = require('prom-client');

const config = require('./config/env');
const bookingsRoutes = require('./routes/bookingsRoutes');
const logger = require('./utils/logger');

const app = express();
const register = client.register;

client.collectDefaultMetrics({ prefix: `${config.metricsPrefix}_` });

const httpRequestsTotal = new client.Counter({
  name: `${config.metricsPrefix}_http_requests_total`,
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new client.Histogram({
  name: `${config.metricsPrefix}_http_request_duration_seconds`,
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2],
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const labels = {
      method: req.method,
      route: req.route?.path || req.path || 'unknown',
      status_code: String(res.statusCode),
    };
    httpRequestsTotal.inc(labels);
    end(labels);
  });
  next();
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: config.serviceName });
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/bookings', bookingsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((error, _req, res, _next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Server error' });
});

module.exports = app;
