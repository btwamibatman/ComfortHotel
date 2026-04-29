const contactsService = require('../services/contactsService');
const { isValidRecordId } = require('../utils/validators');
const logger = require('../utils/logger');

async function listContacts(req, res) {
  try {
    const contacts = await contactsService.listContacts(req.query);
    return res.status(200).json(contacts);
  } catch (error) {
    logger.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function getContactById(req, res) {
  if (!isValidRecordId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const contact = await contactsService.getContactById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    return res.status(200).json(contact);
  } catch (error) {
    logger.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function createContact(req, res) {
  const { name, email, message } = req.body;
  const validationError = contactsService.validateContactInput({ name, email, message });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await contactsService.createContact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      created_at: new Date(),
      created_by: req.session.user.username,
    });

    return res.status(201).json({
      message: 'Contact created successfully',
      id: result.insertedId,
    });
  } catch (error) {
    logger.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function updateContact(req, res) {
  if (!isValidRecordId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const { name, email, message } = req.body;
  const validationError = contactsService.validateContactInput({ name, email, message });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await contactsService.updateContact(req.params.id, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      updated_at: new Date(),
      updated_by: req.session.user.username,
    });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const updatedContact = await contactsService.getContactById(req.params.id);
    return res.status(200).json(updatedContact);
  } catch (error) {
    logger.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function deleteContact(req, res) {
  if (!isValidRecordId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const result = await contactsService.deleteContact(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    return res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    logger.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function submitPublicContact(req, res) {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send('All fields are required');
  }

  const validationError = contactsService.validateContactInput({ name, email, message });
  if (validationError) {
    return res.status(400).send(validationError);
  }

  try {
    await contactsService.createContact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      created_at: new Date(),
      source: 'public_form',
    });

    return res.send(`<h2>Thanks, ${name}! Your message has been saved.</h2><a href="/">Back</a>`);
  } catch (error) {
    logger.error('Database error:', error);
    return res.status(500).send('Error saving data');
  }
}

module.exports = {
  listContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  submitPublicContact,
};
