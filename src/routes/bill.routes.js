const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const billController = require('../controllers/bill.controller');

router.post('/upload', upload.single('file'), billController.uploadBill);
router.get('/job/:jobId/stream', billController.streamJobStatus);
router.get('/history', billController.getHistory);
router.get('/job/:jobId', billController.getJob);

module.exports = router;