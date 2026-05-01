const app = require('./src/app');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');
const connectDB = require('./src/database/postgres');

async function startServer() {
  try {
    await connectDB();
    app.listen(config.port, () => {
      logger.info(`Server started on http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
