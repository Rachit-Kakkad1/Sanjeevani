// TODO: add google oauth scope validation
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/google', authController.googleAuth);

module.exports = router;
