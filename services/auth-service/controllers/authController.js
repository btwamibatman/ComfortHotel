const authService = require('../services/authService');
const logger = require('../utils/logger');

function validateCredentials(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return null;
  }
  return { username, password };
}

function setUserHeaders(res, user) {
  res.set('X-User-Id', user.id);
  res.set('X-User-Role', user.role);
  res.set('X-User-Name', user.username);
}

function persistSession(req, res, user, message) {
  req.session.user = user;
  req.session.save((err) => {
    if (err) {
      logger.error('Session save error:', err);
      return res.status(500).json({ error: 'Session error' });
    }

    setUserHeaders(res, user);
    return res.status(200).json({
      success: true,
      message,
      user: {
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      },
    });
  });
}

async function adminLogin(req, res) {
  const credentials = validateCredentials(req, res);
  if (!credentials) {
    return;
  }

  try {
    const result = await authService.login({
      ...credentials,
      roleRule: 'admin-only',
    });

    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }

    return persistSession(req, res, result.data, 'Admin login successful');
  } catch (error) {
    logger.error('Admin login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function userLogin(req, res) {
  const credentials = validateCredentials(req, res);
  if (!credentials) {
    return;
  }

  try {
    const result = await authService.login({
      ...credentials,
      roleRule: 'manager-only',
    });

    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }

    return persistSession(req, res, result.data, 'User login successful');
  } catch (error) {
    logger.error('User login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    res.clearCookie('sessionId');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
}

function authStatus(req, res) {
  if (req.session && req.session.user) {
    setUserHeaders(res, req.session.user);
    return res.status(200).json({
      authenticated: true,
      user: req.session.user,
    });
  }

  if (req.get('X-Original-URI')) {
    return res.status(401).json({ authenticated: false });
  }

  return res.status(200).json({ authenticated: false });
}

module.exports = {
  adminLogin,
  userLogin,
  logout,
  authStatus,
};
