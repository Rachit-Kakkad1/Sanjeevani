const express = require('express');
const schemeController = require('../controllers/schemeController');

const router = express.Router();

router.get('/', schemeController.getSchemes);

module.exports = router;
