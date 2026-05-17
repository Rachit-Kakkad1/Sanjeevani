const crypto = require('crypto');
const fs = require('fs');
const FileCache = require('../models/fileCache.model');
const logger = require('./logger');

exports.getFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
};

exports.getCachedOCR = async (hash) => {
  try {
    const cached = await FileCache.findOne({ fileHash: hash }).lean();
    return cached ? cached.ocrData : null;
  } catch (err) {
    logger.error('Cache read error:', err.message);
    return null;
  }
};

exports.setCachedOCR = async (hash, ocrData) => {
  try {
    await FileCache.create({ fileHash: hash, ocrData });
  } catch (err) {
    if (err.code !== 11000) {
      logger.error('Cache write error:', err.message);
    }
  }
};
