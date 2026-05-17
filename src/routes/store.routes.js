const express = require('express');
const router = express.Router();
const { getNearbyStores, createStore } = require('../controllers/store.controller');

router.get('/nearby', getNearbyStores);
router.post('/', createStore); // Use for seeding or admin purposes

module.exports = router;
