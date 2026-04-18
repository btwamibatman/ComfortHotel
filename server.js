const app = require('./src/app');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');

app.listen(config.port, () => {
  logger.info(`Server started on http://localhost:${config.port}`);
});
