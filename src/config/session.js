const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const config = require('./env');
const { pool } = require('../database/postgres');

function createSessionMiddleware() {
  return session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new PgSession({
      pool,
      tableName: 'sessions',
      ttl: config.sessionTtlSeconds,
    }),
    cookie: {
      httpOnly: true,
      secure: config.isProduction ? 'auto' : false,
      maxAge: config.sessionTtlSeconds * 1000,
      sameSite: 'lax',
    },
    name: 'sessionId',
  });
}

module.exports = createSessionMiddleware;
