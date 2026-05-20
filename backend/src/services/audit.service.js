const { performance } = require('perf_hooks');
const Bill = require('../models/bill.model');
const { findBestMatch } = require('../utils/matcher');
const { findBestProcedureMatch } = require('../services/matcher');
const logger = require('../utils/logger');

/**
 * Dual-source audit pipeline:
 *   1. Try matching against ReferenceItem (seeded general items)
 *   2. If no match, fall back to CGHSProcedure (1,995 govt-rate procedures via Fuse.js)
 *   3. If still no match, flag item as "unverified"
 */
async function computeAudit(billId, ocrData) {
  const items = ocrData.items || [];
  
  if (items.length === 0) {
    logger.warn(`[AUDIT] No items found in bill ${billId}. Finalizing as empty.`);
  }

  const analyzedItems = [];
  let totalCharged = 0;
  let totalReference = 0;
  let totalOvercharge = 0;
  let matchedCount = 0;
  let unverifiedCount = 0;

  for (const item of items) {
    const rawName = item.rawName || item.name;
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const unitPrice = price / quantity;
    const totalPrice = price;

    totalCharged += totalPrice;

    // ── Source 1: Try ReferenceItem collection ──
    const { match, method, score } = await findBestMatch(rawName);

    let isOvercharged = false;
    let overchargeAmount = 0;
    let matchedRefId = null;
    let matchMethod = method;
    let matchConfidence = score;
    let isUnverified = false;
    let referencePrice = null;
    let referenceSource = null;

    if (match) {
      // Matched against ReferenceItem
      matchedRefId = match._id;
      const refPrice = match.standardPrice !== undefined ? match.standardPrice : match.price;
      referencePrice = refPrice;
      referenceSource = 'REFERENCE';
      const expectedPrice = refPrice * quantity;
      totalReference += expectedPrice;
      matchedCount++;

      if (totalPrice > expectedPrice) {
        isOvercharged = true;
        overchargeAmount = Math.round((totalPrice - expectedPrice) * 100) / 100;
        totalOvercharge += overchargeAmount;
      }
    } else {
      // ── Source 2: Fall back to CGHS Procedure (Fuse.js matcher) ──
      const cghsResult = await findBestProcedureMatch(rawName);

      if (cghsResult.matched && cghsResult.matchedProcedure) {
        const proc = cghsResult.matchedProcedure;
        // Use NABH rate as the standard reference (most common hospital tier)
        const cghsRate = proc.NABH || proc.nonNABH || proc.superSpeciality || 0;
        referencePrice = cghsRate;
        referenceSource = 'CGHS';
        matchMethod = 'CGHS_FUSE';
        matchConfidence = cghsResult.confidence;

        const expectedPrice = cghsRate * quantity;
        totalReference += expectedPrice;
        matchedCount++;

        if (totalPrice > expectedPrice) {
          isOvercharged = true;
          overchargeAmount = Math.round((totalPrice - expectedPrice) * 100) / 100;
          totalOvercharge += overchargeAmount;
        }

        logger.info(
          `[AUDIT] CGHS match: "${rawName}" → "${proc.canonicalName}" ` +
          `(NABH=₹${cghsRate}, charged=₹${totalPrice}, ` +
          `overcharge=${isOvercharged ? '₹' + overchargeAmount : 'none'}, ` +
          `confidence=${cghsResult.confidence})`
        );
      } else {
        // ── No match in either source — mark as unverified ──
        isUnverified = true;
        unverifiedCount++;
        totalReference += totalPrice; // Use billed price as fallback
        matchMethod = 'NONE';
        matchConfidence = cghsResult ? cghsResult.confidence : 0;

        logger.warn(
          `[AUDIT] UNVERIFIED item: "${rawName}" charged=₹${totalPrice} — ` +
          `no matching CGHS or reference procedure found`
        );
      }
    }

    analyzedItems.push({
      rawName,
      matchedReference: matchedRefId,
      quantity,
      unitPrice: Math.round(unitPrice * 100) / 100,
      totalPrice,
      isOvercharged,
      overchargeAmount,
      matchMethod,
      ocrConfidence: item.confidence || 0,
      matchConfidence: Math.round(matchConfidence * 100) / 100,
      isUnverified,
      referencePrice,
      referenceSource
    });
  }

  const percentageDiff = totalReference > 0 ? ((totalCharged - totalReference) / totalReference) * 100 : 0;

  const updatedBill = await Bill.findByIdAndUpdate(
    billId,
    {
      items: analyzedItems,
      totalCharged: Math.round(totalCharged * 100) / 100,
      calculatedTotal: Math.round(totalReference * 100) / 100,
      totalOvercharge: Math.round(totalOvercharge * 100) / 100,
      status: 'COMPLETED'
    },
    { new: true }
  ).populate('items.matchedReference');

  if (!updatedBill) {
    throw new Error('Bill not found after audit update');
  }

  logger.info(
    `[AUDIT] Bill ${billId}: charged=₹${totalCharged}, reference=₹${totalReference}, ` +
    `overcharge=₹${totalOvercharge}, matched=${matchedCount}/${items.length}, ` +
    `unverified=${unverifiedCount}`
  );

  return {
    bill: updatedBill,
    summary: {
      totalCharged: Math.round(totalCharged * 100) / 100,
      totalReference: Math.round(totalReference * 100) / 100,
      totalOvercharge: Math.round(totalOvercharge * 100) / 100,
      percentageDiff: parseFloat(percentageDiff.toFixed(2)),
      itemCount: items.length,
      overchargedItemCount: analyzedItems.filter(i => i.isOvercharged).length,
      unverifiedItemCount: unverifiedCount,
      matchedItemCount: matchedCount
    }
  };
}

module.exports = { computeAudit };