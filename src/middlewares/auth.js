function isApiRequest(req) {
  return req.originalUrl.startsWith('/api/');
}

function getSessionUser(req) {
  return req.session && req.session.user ? req.session.user : null;
}

function isAuthenticated(req, res, next) {
  if (getSessionUser(req)) {
    return next();
  }

  if (isApiRequest(req)) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to perform this action',
    });
  }

  return res.redirect('/admin/login?error=Please login first');
}

function isAdmin(req, res, next) {
  const user = getSessionUser(req);
  if (user && user.role === 'admin') {
    return next();
  }

  if (user && !isApiRequest(req)) {
    return res.redirect('/staff/dashboard?error=Use staff dashboard for your role');
  }

  if (isApiRequest(req)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin privileges required',
    });
  }

  return res.status(403).send('Access denied: Admin privileges required');
}

function isStaff(req, res, next) {
  const user = getSessionUser(req);
  if (user && user.role !== 'admin') {
    return next();
  }

  if (user && !isApiRequest(req)) {
    return res.redirect('/admin/dashboard');
  }

  if (isApiRequest(req)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Staff privileges required',
    });
  }

  return res.status(403).send('Access denied: Staff privileges required');
}

module.exports = {
  isAuthenticated,
  isAdmin,
  isStaff,
};
