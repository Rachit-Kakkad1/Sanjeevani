const { performance } = require('perf_hooks');
const Bill = require('../models/bill.model');
const { findBestMatch } = require('../utils/matcher');
const logger = require('../utils/logger');

async function computeAudit(billId, ocrData) {
  const items = ocrData.items || [];
  
  if (items.length === 0) {
    logger.warn(`[AUDIT] No items found in bill ${billId}. Finalizing as empty.`);
  }

  const analyzedItems = [];
  let totalCharged = 0;
  let totalReference = 0;
  let totalOvercharge = 0;

  for (const item of items) {
    const rawName = item.rawName || item.name;
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const unitPrice = price / quantity;
    const totalPrice = price;

    totalCharged += totalPrice;

    const { match, method, score } = await findBestMatch(rawName);

    let isOvercharged = false;
    let overchargeAmount = 0;
    let matchedRefId = null;

    if (match) {
      matchedRefId = match._id;
      const expectedPrice = match.standardPrice * quantity;
      totalReference += expectedPrice;

      if (totalPrice > expectedPrice) {
        isOvercharged = true;
        overchargeAmount = Math.round((totalPrice - expectedPrice) * 100) / 100;
        totalOvercharge += overchargeAmount;
      }
    } else {
      totalReference += totalPrice;
    }

    analyzedItems.push({
      rawName,
      matchedReference: matchedRefId,
      quantity,
      unitPrice: Math.round(unitPrice * 100) / 100,
      totalPrice,
      isOvercharged,
      overchargeAmount,
      matchMethod: method,
      ocrConfidence: item.confidence || 0,
      matchConfidence: Math.round(score * 100) / 100
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

  logger.info(`[AUDIT] Bill ${billId}: charged=₹${totalCharged}, reference=₹${totalReference}, overcharge=₹${totalOvercharge}`);

  return {
    bill: updatedBill,
    summary: {
      totalCharged: Math.round(totalCharged * 100) / 100,
      totalReference: Math.round(totalReference * 100) / 100,
      totalOvercharge: Math.round(totalOvercharge * 100) / 100,
      percentageDiff: parseFloat(percentageDiff.toFixed(2)),
      itemCount: items.length,
      overchargedItemCount: analyzedItems.filter(i => i.isOvercharged).length
    }
  };
}

module.exports = { computeAudit };