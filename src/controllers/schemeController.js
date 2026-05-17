const Scheme = require('../models/Scheme');
const logger = require('../utils/logger');

exports.getSchemes = async (req, res, next) => {
  try {
    const income = parseFloat(req.query.income);
    const state = req.query.state;

    if (isNaN(income) || income < 0) {
      return res.status(400).json({ error: 'Valid income is required' });
    }

    if (!state) {
      return res.status(400).json({ error: 'State is required' });
    }

    logger.info(`Fetching schemes for income: ${income}, state: ${state}`);

    // Find schemes where:
    // 1. income falls within [minIncome, maxIncome]
    // 2. states array is either empty (national) or contains the requested state
    const schemes = await Scheme.find({
      $and: [
        { minIncome: { $lte: income } },
        { maxIncome: { $gte: income } },
        {
          $or: [
            { states: { $size: 0 } },
            { states: state }
          ]
        }
      ]
    });

    // Calculate impact score: coverageAmount / income
    // Note: handle income = 0 case
    const scoredSchemes = schemes.map(scheme => {
      const score = income > 0 ? (scheme.coverageAmount / income) : scheme.coverageAmount; // arbitrary high score if income is 0
      return {
        ...scheme.toObject(),
        impactScore: score
      };
    });

    // Sort descending by impact score
    scoredSchemes.sort((a, b) => b.impactScore - a.impactScore);

    res.status(200).json(scoredSchemes);

  } catch (error) {
    logger.error(`Error in getSchemes: ${error.message}`);
    next(error);
  }
};
