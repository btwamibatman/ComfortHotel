const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');

app.listen(config.port, () => {
  logger.info(`${config.serviceName} started on port ${config.port}`);
});
