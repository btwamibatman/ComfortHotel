const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const connectDB = require('./database/postgres');

async function startServer() {
  try {
    await connectDB();
    app.listen(config.port, () => {
      logger.info(`${config.serviceName} started on port ${config.port}`);
    });
  } catch (error) {
    logger.error(`Failed to start ${config.serviceName}:`, error);
    process.exit(1);
  }
}

startServer();
