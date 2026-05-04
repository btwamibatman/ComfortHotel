const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');

module.exports = {
  rootDir,
  publicDir: path.join(rootDir, 'public'),
  viewsDir: path.join(rootDir, 'views'),
};
