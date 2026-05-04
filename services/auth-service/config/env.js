require('dotenv').config();

const serviceName = process.env.SERVICE_NAME || 'auth-service';

const config = {
  serviceName,
  metricsPrefix: serviceName.replace(/[^a-zA-Z0-9_]/g, '_'),
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET,
  sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS || 86400),
  admin: {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    email: process.env.ADMIN_EMAIL,
    fullName: process.env.ADMIN_FULL_NAME,
  },
  manager: {
    username: process.env.MANAGER_USERNAME,
    password: process.env.MANAGER_PASSWORD,
    email: process.env.MANAGER_EMAIL,
    fullName: process.env.MANAGER_FULL_NAME,
  },
};

config.isProduction = config.nodeEnv === 'production';

module.exports = config;
