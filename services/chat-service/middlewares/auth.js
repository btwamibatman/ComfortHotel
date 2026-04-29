function readGatewayUser(req) {
  const id = req.get('X-User-Id');
  const role = req.get('X-User-Role');
  const username = req.get('X-User-Name') || id;

  if (!id || !role) {
    return null;
  }

  return { id, role, username };
}

function isAuthenticated(req, res, next) {
  const user = readGatewayUser(req);
  if (user) {
    req.user = user;
    return next();
  }

  return res.status(401).json({
    error: 'Authentication required',
    message: 'Gateway user headers are required',
  });
}

module.exports = {
  isAuthenticated,
};
