const app = require('./src/app');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');
const connectDB = require('./src/database/postgres');
const roomsService = require('./src/services/roomsService');

async function startServer() {
  try {
    await connectDB();
    const initialized = await roomsService.initializeDefaultRooms();
    if (initialized) {
      logger.info('Default rooms initialized in the database');
    }

    app.listen(config.port, () => {
      logger.info(`Server started on http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
