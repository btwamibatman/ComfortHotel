const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const connectDB = require('./database/postgres');
const roomsService = require('./services/roomsService');

async function startServer() {
  try {
    await connectDB();
    const initialized = await roomsService.initializeDefaultRooms();
    if (initialized) {
      logger.info('Default rooms initialized in the database');
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
