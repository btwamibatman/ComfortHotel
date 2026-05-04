const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const config = require('../config/env');

async function login({ username, password, roleRule }) {
  const user = await userRepository.findByUsername(username);

  if (!user) {
    return { error: { status: 401, body: { error: 'Invalid credentials' } } };
  }

  if (roleRule === 'admin-only' && user.role !== 'admin') {
    return {
      error: {
        status: 403,
        body: {
          error: 'Access denied. Admin privileges required.',
          hint: 'Please use the User Login page',
        },
      },
    };
  }

  if (roleRule === 'manager-only' && user.role !== 'manager') {
    return {
      error: {
        status: 403,
        body: {
          error: 'Access denied. Manager privileges required.',
          hint: 'Please use manager credentials',
        },
      },
    };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return { error: { status: 401, body: { error: 'Invalid credentials' } } };
  }

  return {
    data: {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    },
  };
}

function getConfiguredUsers() {
  return [
    { ...config.admin, role: 'admin' },
    { ...config.manager, role: 'manager' },
  ].filter((user) => (
    user.username
    && user.password
    && user.email
    && user.fullName
  ));
}

async function initializeConfiguredUsers() {
  const users = getConfiguredUsers();

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await userRepository.upsertUser({
      ...user,
      password: hashedPassword,
    });
  }

  return users.length;
}

module.exports = {
  initializeConfiguredUsers,
  login,
};
