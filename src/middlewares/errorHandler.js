const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} | ${req.method} ${req.originalUrl}`);

  if (err.name === 'MulterError') {
    const messages = {
      LIMIT_FILE_SIZE: 'File too large. Maximum size is 10MB.',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field.'
    };
    return res.status(400).json({
      success: false,
      error: messages[err.code] || err.message
    });
  }

  if (err.message === 'Invalid file type. Only JPG, PNG and PDF are allowed.') {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_ENTRY'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = { errorHandler };
