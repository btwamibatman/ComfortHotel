const express = require('express');
const infoController = require('../../controllers/infoController');

const router = express.Router();

router.get('/info', infoController.getApiInfo);

module.exports = router;
