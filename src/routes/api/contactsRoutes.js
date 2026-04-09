const express = require('express');
const contactsController = require('../../controllers/contactsController');
const { isAuthenticated } = require('../../middlewares/auth');

const router = express.Router();

router.get('/', contactsController.listContacts);
router.get('/:id', contactsController.getContactById);
router.post('/', isAuthenticated, contactsController.createContact);
router.put('/:id', isAuthenticated, contactsController.updateContact);
router.delete('/:id', isAuthenticated, contactsController.deleteContact);

module.exports = router;
