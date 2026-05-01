const express = require('express');
const contactsController = require('../controllers/contactsController');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

router.post('/', contactsController.createContact);
router.get('/', isAuthenticated, contactsController.listContacts);
router.get('/:id', isAuthenticated, contactsController.getContactById);
router.put('/:id', isAuthenticated, contactsController.updateContact);
router.delete('/:id', isAuthenticated, contactsController.deleteContact);

module.exports = router;
