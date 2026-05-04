const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const connectDB = require('./database/postgres');
const authService = require('./services/authService');

async function startServer() {
  try {
    await connectDB();
    const initializedUsers = await authService.initializeConfiguredUsers();
    if (initializedUsers > 0) {
      logger.info(`Configured auth users initialized: ${initializedUsers}`);
    }

    app.listen(config.port, () => {
      logger.info(`${config.serviceName} started on port ${config.port}`);
    });
  } catch (error) {
    logger.error(`Failed to start ${config.serviceName}:`, error);
    process.exit(1);
  }
}

startServer();
