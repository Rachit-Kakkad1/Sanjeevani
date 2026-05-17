const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { performance } = require('perf_hooks');
const Bill = require('../models/bill.model');
const { processOCR } = require('../services/ocr.service');
const { computeAudit } = require('../services/audit.service');
const cacheService = require('../utils/cache.service');
const { ocrQueue } = require('../utils/queue.service');
const logger = require('../utils/logger');

const sseClients = new Map();

function sendSSE(jobId, data) {
  if (sseClients.has(jobId)) {
    const res = sseClients.get(jobId);
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      logger.error(`SSE write error for job ${jobId}:`, err.message);
      sseClients.delete(jobId);
      return;
    }
    if (data.status === 'COMPLETED' || data.status?.startsWith('FAILED') || data.status === 'TIMEOUT') {
      res.end();
      sseClients.delete(jobId);
    }
  }
}

function cleanupFile(filePath) {
  if (!filePath) return;
  try { fs.unlinkSync(filePath); } catch (e) { /* already cleaned */ }
}

exports.uploadBill = async (req, res, next) => {
  const startTime = performance.now();
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'NO_FILE' });
    }

    const jobId = uuidv4();
    const fileHash = await cacheService.getFileHash(req.file.path);
    const uploadMs = Math.round(performance.now() - startTime);

    const bill = new Bill({
      jobId,
      status: 'QUEUED',
      timings: { uploadMs }
    });
    await bill.save();

    res.status(202).json({
      success: true,
      data: { jobId, message: 'Bill queued for processing' }
    });

    ocrQueue.push(async () => {
      await processJob(req.file, bill._id, jobId, fileHash, performance.now());
    }, jobId);

  } catch (err) {
    cleanupFile(req.file?.path);
    next(err);
  }
};

exports.streamJobStatus = async (req, res) => {
  const { jobId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  sseClients.set(jobId, res);

  try {
    const bill = await Bill.findOne({ jobId }).populate('items.matchedReference');
    if (!bill) {
      sendSSE(jobId, { status: 'FAILED_MATCH', error: 'JOB_NOT_FOUND' });
      return;
    }

    sendSSE(jobId, {
      status: bill.status,
      result: bill.status === 'COMPLETED' ? bill : null,
      error: bill.error
    });
  } catch (err) {
    logger.error('SSE initial fetch error:', err.message);
    res.end();
    sseClients.delete(jobId);
  }

  req.on('close', () => sseClients.delete(jobId));
};

async function processJob(file, billId, jobId, fileHash, queueStart) {
  const queueWaitMs = Math.round(performance.now() - queueStart);

  try {
    await Bill.findByIdAndUpdate(billId, { status: 'PROCESSING', 'timings.queueWaitMs': queueWaitMs });
    sendSSE(jobId, { status: 'PROCESSING' });

    let ocrData;
    let ocrMs = 0;

    const cached = await cacheService.getCachedOCR(fileHash);
    if (cached) {
      logger.info(`[JOB ${jobId}] Cache hit`);
      ocrData = cached;
    } else {
      const ocrStart = performance.now();
      ocrData = await processOCR(file.path, file.originalname);
      ocrMs = Math.round(performance.now() - ocrStart);
      await cacheService.setCachedOCR(fileHash, ocrData);
    }

    cleanupFile(file.path);

    const matchStart = performance.now();
    const auditResult = await computeAudit(billId, ocrData);
    const matchMs = Math.round(performance.now() - matchStart);
    const bill = auditResult.bill;

    bill.timings = { ...bill.timings, ocrMs, matchMs };
    await bill.save();

    sendSSE(jobId, {
      status: 'COMPLETED',
      result: bill,
      summary: auditResult.summary
    });

  } catch (err) {
    cleanupFile(file.path);
    logger.error(`[JOB ${jobId}] Failed:`, err.message);
    const status = (err.message?.includes('timeout') || err.code === 'ECONNREFUSED') ? 'TIMEOUT' : 'FAILED_OCR';
    await Bill.findByIdAndUpdate(billId, { status, error: err.message });
    sendSSE(jobId, { status, error: err.message });
  }
}

exports.getHistory = async (req, res, next) => {
  try {
    const bills = await Bill.find({ status: 'COMPLETED' })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, data: bills });
  } catch (err) {
    next(err);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const bill = await Bill.findOne({ jobId }).populate('items.matchedReference');

    if (!bill) {
      return res.status(404).json({ success: false, error: 'JOB_NOT_FOUND' });
    }

    res.json({ success: true, data: bill });
  } catch (err) {
    next(err);
  }
};