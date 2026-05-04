function isApiRequest(req) {
  return req.originalUrl.startsWith('/api/');
}

function getSessionUser(req) {
  return req.session && req.session.user ? req.session.user : null;
}

function hasAnyRole(user, roles) {
  return Boolean(user && roles.includes(user.role));
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

function isInternalStaff(req, res, next) {
  const user = getSessionUser(req);
  if (!user) {
    if (isApiRequest(req)) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to perform this action',
      });
    }

    return res.redirect('/staff/login?error=Please login first');
  }

  if (hasAnyRole(user, ['admin', 'manager'])) {
    return next();
  }

  if (isApiRequest(req)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Staff or admin privileges required',
    });
  }

  return res.redirect('/staff/login?error=Staff access required');
}

function isStaff(req, res, next) {
  const user = getSessionUser(req);
  if (user && user.role === 'manager') {
    return next();
  }

  if (user && !isApiRequest(req)) {
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    return res.status(403).send('Access denied: Staff privileges required');
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
  isInternalStaff,
};
