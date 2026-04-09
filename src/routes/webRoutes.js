const express = require('express');
const path = require('path');
const { sendView, sendRoomImage } = require('../controllers/pageController');
const contactsController = require('../controllers/contactsController');
const { isAuthenticated } = require('../middlewares/auth');
const { viewsDir } = require('../config/paths');

const router = express.Router();

router.get('/', sendView('index.html'));
router.get('/about', sendView('about.html'));
router.get('/contact', sendView('contact.html'));
router.get('/rooms', sendView('rooms.html'));
router.get('/booking', sendView('booking.html'));

router.get('/1.jpg', sendView('1.jpg'));
router.get('/2.jpg', sendView('2.jpg'));
router.get('/3.jpg', sendView('3.jpg'));
router.get('/item/:id', sendRoomImage);

router.get('/admin', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  return res.sendFile(path.join(viewsDir, 'admin-login.html'));
});

router.get('/user', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  return res.sendFile(path.join(viewsDir, 'user-login.html'));
});

router.get('/admin/dashboard', isAuthenticated, sendView('admin-dashboard.html'));
router.post('/contact', contactsController.submitPublicContact);

module.exports = router;
