const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const INITIAL_RETRY_MS = 2000;

// TODO: tune max retries for production
const connectDB = async (retryCount = 0) => {
  try {
    // Ensure the URI includes a database name
    let uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Add database name 'medclear' if no DB is specified in the URI path
    // Matches both mongodb+srv://...mongodb.net/? and mongodb://...:27017/?
    if (uri.match(/\/\?/) && !uri.match(/\/\w+\?/)) {
      uri = uri.replace('/\?', '/medclear?');
      logger.info('Added database name "medclear" to connection URI');
    }

    logger.info(`Attempting MongoDB connection... (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    logger.info(`MongoDB Connected: ${conn.connection.host} | DB: ${conn.connection.name}`);
  } catch (error) {
    logger.error('MongoDB connection failed:');
    logger.error(`  Message: ${error.message}`);
    if (error.code) {
      logger.error(`  Code: ${error.code}`);
    }

    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_MS * Math.pow(2, retryCount);
      logger.info(`Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB(retryCount + 1);
    }

    logger.error('All MongoDB connection attempts failed. Exiting.');
    process.exit(1);
  }
};

module.exports = connectDB;
