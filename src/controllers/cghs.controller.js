const cghsService = require('../services/cghs.service');

exports.getProcedures = async (req, res, next) => {
  try {
    const { search, classification, page, limit } = req.query;
    
    const result = await cghsService.getProcedures({
      search,
      classification,
      page,
      limit
    });
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

exports.getClassifications = async (req, res, next) => {
  try {
    const classifications = await cghsService.getClassifications();
    res.json({
      success: true,
      data: classifications
    });
  } catch (err) {
    next(err);
  }
};
