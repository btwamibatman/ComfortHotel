const express = require('express');
const path = require('path');
const { sendView, sendRoomImage } = require('../controllers/pageController');
const contactsController = require('../controllers/contactsController');
const { isAdmin, isStaff } = require('../middlewares/auth');
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

function getDashboardPath(role) {
  return role === 'admin' ? '/admin/dashboard' : '/staff/dashboard';
}

router.get('/dashboard', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect(getDashboardPath(req.session.user.role));
  }
  return res.redirect('/admin/login');
});

router.get('/admin', (req, res) => {
  return res.redirect('/admin/login');
});

router.get('/admin/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect(getDashboardPath(req.session.user.role));
  }
  return res.sendFile(path.join(viewsDir, 'admin-login.html'));
});

router.get('/user', (req, res) => {
  return res.redirect('/staff/login');
});

router.get('/staff', (req, res) => {
  return res.redirect('/staff/login');
});

router.get('/staff/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect(getDashboardPath(req.session.user.role));
  }
  return res.sendFile(path.join(viewsDir, 'user-login.html'));
});

router.get('/admin/dashboard', isAdmin, sendView('admin-dashboard.html'));
router.get('/staff/dashboard', isStaff, sendView('admin-dashboard.html'));
router.post('/contact', contactsController.submitPublicContact);

module.exports = router;
