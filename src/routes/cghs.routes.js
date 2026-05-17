const express = require('express');
const router = express.Router();
const cghsController = require('../controllers/cghs.controller');

router.get('/procedures', cghsController.getProcedures);
router.get('/classifications', cghsController.getClassifications);

module.exports = router;
