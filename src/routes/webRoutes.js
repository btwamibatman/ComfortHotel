const express = require('express');
const { sendView, sendRoomImage } = require('../controllers/pageController');
const contactsController = require('../controllers/contactsController');
const { isAdmin, isStaff } = require('../middlewares/auth');

const router = express.Router();

router.get('/', sendView('index', { activePage: 'index' }));
router.get('/about', sendView('about', { activePage: 'about' }));
router.get('/contact', sendView('contact', { activePage: 'contact' }));
router.get('/rooms', sendView('rooms', { activePage: 'rooms' }));
router.get('/booking', sendView('booking', { activePage: 'booking' }));

router.get('/1.jpg', (req, res) => { sendRoomImage({ params: { id: '1' } }, res); });
router.get('/2.jpg', (req, res) => { sendRoomImage({ params: { id: '2' } }, res); });
router.get('/3.jpg', (req, res) => { sendRoomImage({ params: { id: '3' } }, res); });
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
  return res.render('admin-login', { activePage: 'admin' });
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
  return res.render('user-login', { activePage: 'login' });
});

router.get('/admin/dashboard', isAdmin, sendView('admin-dashboard', { activePage: '' }));
router.get('/staff/dashboard', isStaff, sendView('admin-dashboard', { activePage: '' }));
router.post('/contact', contactsController.submitPublicContact);

module.exports = router;
