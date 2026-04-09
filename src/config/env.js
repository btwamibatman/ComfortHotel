require('dotenv').config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME,
  sessionSecret: process.env.SESSION_SECRET,
  sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS),
};

config.isProduction = config.nodeEnv === 'production';

module.exports = config;
