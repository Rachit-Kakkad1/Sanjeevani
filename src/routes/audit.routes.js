// TODO: add route level middleware
const express = require('express');
const router = express.Router();
const { runAudit } = require('../controllers/audit.controller');

router.post('/', runAudit);

module.exports = router;
