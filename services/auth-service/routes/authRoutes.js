const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/auth/admin/login', authController.adminLogin);
router.post('/auth/staff/login', authController.userLogin);
router.post('/auth/logout', authController.logout);
router.get('/api/auth/status', authController.authStatus);

router.post('/admin/login', authController.adminLogin);
router.post('/user/login', authController.userLogin);
router.post('/admin/logout', authController.logout);

module.exports = router;
