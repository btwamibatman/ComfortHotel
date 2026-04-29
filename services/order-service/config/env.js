require('dotenv').config();

const serviceName = process.env.SERVICE_NAME || 'order-service';

const config = {
  serviceName,
  metricsPrefix: serviceName.replace(/[^a-zA-Z0-9_]/g, '_'),
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  productServiceUrl: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3000',
};

config.isProduction = config.nodeEnv === 'production';

module.exports = config;
