const authService = require('../services/authService');

function validateCredentials(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return null;
  }
  return { username, password };
}

function persistSession(req, res, user, message) {
  req.session.user = user;
  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
      return res.status(500).json({ error: 'Session error' });
    }

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
    console.error('Admin login error:', error);
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
    console.error('User login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    res.clearCookie('sessionId');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
}

function authStatus(req, res) {
  if (req.session && req.session.user) {
    return res.status(200).json({
      authenticated: true,
      user: req.session.user,
    });
  }

  return res.status(200).json({ authenticated: false });
}

module.exports = {
  adminLogin,
  userLogin,
  logout,
  authStatus,
};
