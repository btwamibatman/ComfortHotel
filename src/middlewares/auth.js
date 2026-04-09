function isApiRequest(req) {
  return req.path.startsWith('/api/');
}

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  if (isApiRequest(req)) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to perform this action',
    });
  }

  return res.redirect('/admin?error=Please login first');
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }

  if (isApiRequest(req)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin privileges required',
    });
  }

  return res.status(403).send('Access denied: Admin privileges required');
}

module.exports = {
  isAuthenticated,
  isAdmin,
};
