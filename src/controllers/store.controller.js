const Store = require('../models/store.model');
const logger = require('../utils/logger');

/**
 * @desc    Get nearby Jan Aushadhi stores
 * @route   GET /api/v1/stores/nearby
 * @access  Public
 */
exports.getNearbyStores = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance = 10000 } = req.query; // maxDistance in meters (default 10km)

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude'
      });
    }

    logger.info(`Fetching stores near: ${latitude}, ${longitude} within ${maxDistance}m`);

    const stores = await Store.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude] // [lng, lat] for GeoJSON
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    logger.error(`Error in getNearbyStores: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Add a new store (utility for seeding)
 * @route   POST /api/v1/stores
 * @access  Private (should be protected in production)
 */
exports.createStore = async (req, res, next) => {
  try {
    const store = await Store.create(req.body);
    res.status(201).json({
      success: true,
      data: store
    });
  } catch (error) {
    logger.error(`Error in createStore: ${error.message}`);
    next(error);
  }
};
