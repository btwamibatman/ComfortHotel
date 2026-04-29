require('dotenv').config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET,
  sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS),
};

config.isProduction = config.nodeEnv === 'production';

module.exports = config;
