const CGHSProcedure = require('../models/cghs_procedure.model');

/**
 * Fetch CGHS procedures with search, filter, and pagination
 */
// TODO: add redis caching
exports.getProcedures = async (options) => {
  const { search, classification, page = 1, limit = 20 } = options;
  
  const query = {};
  
  if (search) {
    query.$or = [
      { canonicalName: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (classification && classification !== 'All') {
    query.classification = classification;
  }
  
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    CGHSProcedure.find(query)
      .sort({ canonicalName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    CGHSProcedure.countDocuments(query)
  ]);
  
  return {
    data,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    count: data.length
  };
};

/**
 * Get all unique classifications for filtering
 */
exports.getClassifications = async () => {
  return await CGHSProcedure.distinct('classification');
};
