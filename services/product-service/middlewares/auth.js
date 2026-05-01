function isAdmin(req, res, next) {
  if (req.get('X-User-Role') === 'admin') {
    return next();
  }

  return res.status(403).json({
    error: 'Forbidden',
    message: 'Admin privileges required',
  });
}

module.exports = {
  isAdmin,
};
