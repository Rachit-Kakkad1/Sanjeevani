const { generateAuditReport } = require('../services/auditEngine');
const logger = require('../utils/logger');

/**
 * Handles the POST /api/audit request
 */
const runAudit = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input. "items" must be an array of objects with "name" and "amount".'
      });
    }

    const report = await generateAuditReport(items);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Audit controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during audit processing.',
      error: error.message
    });
  }
};

module.exports = {
  runAudit
};
