const contactsRepository = require('../repositories/contactsRepository');
const { isValidEmail } = require('../utils/validators');
const { buildListQuery } = require('../utils/query');

async function listContacts(query) {
  const filter = {};
  if (query.email) {
    filter.email = query.email;
  }
  if (query.name) {
    filter.name = query.name;
  }

  const { sort, projection } = buildListQuery(query, 'created_at');
  return contactsRepository.listContacts({ filter, sort, projection });
}

async function getContactById(id) {
  return contactsRepository.getContactById(id);
}

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

async function createContact(payload) {
  return contactsRepository.createContact(payload);
}

async function updateContact(id, payload) {
  return contactsRepository.updateContact(id, payload);
}

async function deleteContact(id) {
  return contactsRepository.deleteContact(id);
}

module.exports = {
  listContacts,
  getContactById,
  validateContactInput,
  createContact,
  updateContact,
  deleteContact,
};
