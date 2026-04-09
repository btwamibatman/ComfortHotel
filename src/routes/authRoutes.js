const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/admin/login', authController.adminLogin);
router.post('/user/login', authController.userLogin);
router.post('/admin/logout', authController.logout);
router.get('/api/auth/status', authController.authStatus);

module.exports = router;
