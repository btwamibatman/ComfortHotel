const express = require('express');
const config = require('./config/env');
const { publicDir, viewsDir } = require('./config/paths');
const createSessionMiddleware = require('./config/session');
const requestLogger = require('./middlewares/requestLogger');
const { apiNotFound, notFound, errorHandler } = require('./middlewares/errorHandlers');
const webRoutes = require('./routes/webRoutes');
const apiRoutes = require('./routes/api');
const client = require('prom-client');
const register = client.register;

const app = express();
client.collectDefaultMetrics();

// Custom HTTP metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2],
});

if (config.isProduction) {
  app.set('trust proxy', 1);
}

app.set('view engine', 'ejs');
app.set('views', viewsDir);
app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(express.json({ limit: '100kb' }));
app.use(createSessionMiddleware());
app.use(requestLogger);

// Metrics middleware вЂ” before all routes
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const labels = {
      method: req.method,
      route: req.path || 'unknown',
      status_code: String(res.statusCode),
    };
    httpRequestsTotal.inc(labels);
    end(labels);
  });
  next();
});

app.use('/api', apiRoutes);
app.use(webRoutes);

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api', apiNotFound);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
