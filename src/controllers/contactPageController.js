const config = require('../config/env');
const { isValidEmail } = require('../utils/validators');
const logger = require('../utils/logger');

function validateContactInput({ name, email, message }) {
  if (!name || !email || !message) {
    return 'All fields are required';
  }

  if (!isValidEmail(email)) {
    return 'Invalid email format';
  }

  if (name.length < 2 || name.length > 100) {
    return 'Name must be between 2 and 100 characters';
  }

  return null;
}

async function submitPublicContact(req, res) {
  const { name, email, message } = req.body;
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

    return res.send(`<h2>Thanks, ${name}! Your message has been saved.</h2><a href="/">Back</a>`);
  } catch (error) {
    logger.error('Chat service error:', error);
    return res.status(500).send('Error saving data');
  }
}

module.exports = {
  submitPublicContact,
};
