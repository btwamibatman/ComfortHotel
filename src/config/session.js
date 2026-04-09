const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('./env');

function createSessionMiddleware() {
  return session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.mongoUri,
      dbName: config.mongoDbName,
      collectionName: 'sessions',
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
