const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const lusca = require('lusca');
const config = require('./env');
const { pool } = require('../database/postgres');

function createSessionMiddleware() {
  const sessionMiddleware = session({
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
      secure: true,
      maxAge: config.sessionTtlSeconds * 1000,
      sameSite: 'lax',
    },
    name: 'sessionId',
  });

  return [sessionMiddleware, lusca.csrf()];
}

module.exports = createSessionMiddleware;
