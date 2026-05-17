const { findBestProcedureMatch } = require('./matcher');
const logger = require('../utils/logger');

/**
 * Generates a structured audit report for a set of bill items
 * @param {Array} items - [{ name: string, amount: number }]
 * @returns {Object} - Audit report
 */
// TODO: refactor to use workers for large bills
const generateAuditReport = async (items) => {
  logger.info(`[AUDIT_ENGINE] Starting audit for ${items.length} items...`);
  
  const auditResults = [];
  let totalBilled = 0;
  let totalAllowed = 0;
  let totalSavingPotential = 0;

  for (const item of items) {
    const rawName = item.name;
    const billedAmount = item.amount || 0;
    totalBilled += billedAmount;

    try {
      const matchResult = await findBestProcedureMatch(rawName);

      if (matchResult.matched) {
        const proc = matchResult.matchedProcedure;
        // Using NABH rate as standard for private hospital comparison
        const officialRate = proc.NABH || proc.nonNABH || 0;
        const difference = billedAmount - officialRate;
        const potentialOvercharge = difference > 0;

        const auditItem = {
          billItem: rawName,
          matchedProcedure: proc.canonicalName,
          matchedCode: proc.code,
          officialRate: officialRate,
          hospitalCharged: billedAmount,
          difference: Math.max(0, difference),
          potentialOvercharge: potentialOvercharge,
          confidence: matchResult.confidence,
          source: 'CGHS',
          reason: potentialOvercharge 
            ? `Hospital charge (₹${billedAmount}) exceeds official CGHS NABH reference rate of ₹${officialRate}.`
            : "Charge is within or equal to CGHS reference rate."
        };

        auditResults.push(auditItem);
        totalAllowed += officialRate;
        if (potentialOvercharge) {
          totalSavingPotential += difference;
        }
      } else {
        auditResults.push({
          billItem: rawName,
          matchedProcedure: 'No Match Found',
          matchedCode: 'N/A',
          officialRate: 0,
          hospitalCharged: billedAmount,
          difference: 0,
          potentialOvercharge: false,
          confidence: matchResult.confidence,
          source: 'N/A',
          reason: "No corresponding CGHS procedure could be identified with sufficient confidence (>0.60)."
        });
        totalAllowed += billedAmount; 
      }
    } catch (err) {
      logger.error(`Error processing item ${rawName}:`, err);
      auditResults.push({
        billItem: rawName,
        error: "Failed to process item during matching phase."
      });
    }
  }

  const report = {
    summary: {
      totalItems: items.length,
      matchedItems: auditResults.filter(i => i.matchedCode !== 'N/A' && !i.error).length,
      totalBilled: parseFloat(totalBilled.toFixed(2)),
      totalAllowed: parseFloat(totalAllowed.toFixed(2)),
      totalSavingPotential: parseFloat(totalSavingPotential.toFixed(2)),
      savingsPercentage: totalBilled > 0 ? parseFloat(((totalSavingPotential / totalBilled) * 100).toFixed(2)) : 0,
      auditDate: new Date().toISOString()
    },
    items: auditResults
  };

  logger.info(`[AUDIT_ENGINE] Audit complete. Potential savings: ₹${totalSavingPotential}`);
  return report;
};

module.exports = {
  generateAuditReport
};
