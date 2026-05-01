function readGatewayUser(req) {
  const id = req.get('X-User-Id');
  const role = req.get('X-User-Role');
  const username = req.get('X-User-Name') || id;

  if (!id || !role) {
    return null;
  }

  return { id, role, username };
}

function isInternalStaff(req, res, next) {
  const user = readGatewayUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Gateway user headers are required',
    });
  }

  if (['admin', 'manager'].includes(user.role)) {
    req.user = user;
    return next();
  }

  return res.status(403).json({
    error: 'Forbidden',
    message: 'Staff or admin privileges required',
  });
}

function isAdmin(req, res, next) {
  const user = readGatewayUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Gateway user headers are required',
    });
  }

  if (user.role === 'admin') {
    req.user = user;
    return next();
  }

  return res.status(403).json({
    error: 'Forbidden',
    message: 'Admin privileges required',
  });
}

module.exports = {
  isInternalStaff,
  isAdmin,
};
