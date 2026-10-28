const config = require('../config/env');
const { validateContactInput } = require('../utils/validators');
const logger = require('../utils/logger');

async function submitPublicContact(req, res) {
  const { name, email, message } = req.body || {};
  const validationError = validateContactInput({ name, email, message });

  if (validationError) {
    return res.status(400).send(validationError);
  }

  if (!config.chatServiceUrl) {
    return res.status(500).send('Contact service is not configured');
  }

  try {
    const response = await fetch(`${config.chatServiceUrl}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat service returned ${response.status}`);
    }

    return res.redirect('/contact?sent=1');
  } catch (error) {
    logger.error('Chat service error:', error);
    return res.status(500).send('Error saving data');
  }
}

module.exports = {
  submitPublicContact,
};
