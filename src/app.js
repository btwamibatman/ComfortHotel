const express = require('express');
const config = require('./config/env');
const { publicDir } = require('./config/paths');
const createSessionMiddleware = require('./config/session');
const requestLogger = require('./middlewares/requestLogger');
const { apiNotFound, notFound, errorHandler } = require('./middlewares/errorHandlers');
const webRoutes = require('./routes/webRoutes');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/api');

const app = express();

if (config.isProduction) {
  app.set('trust proxy', 1);
}

app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(createSessionMiddleware());
app.use(requestLogger);

app.use(authRoutes);
app.use('/api', apiRoutes);
app.use(webRoutes);

app.use('/api', apiNotFound);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
