const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const logger = require('../utils/logger');
const mockOcrResponse = require('../utils/mockOcrResponse');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const TIMEOUT = 60000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callOCRService(filePath, filename, retryCount = 0) {
  if (process.env.USE_MOCK_OCR === "true") {
    logger.info("[OCR] Using MOCK OCR (configured via env)");
    return mockOcrResponse();
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath), filename);

  const ocrUrl = process.env.OCR_SERVICE_URL || 'http://localhost:8000/ocr/extract';

  try {
    const response = await axios.post(ocrUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'Accept': 'application/json'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: Number(process.env.OCR_TIMEOUT_MS || TIMEOUT)
    });

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'OCR service returned invalid response');
    }

    logger.info("[OCR] Using REAL OCR");
    return response.data.data;
  } catch (err) {
    const isRetryable = err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.response?.status >= 500;
    
    if (retryCount < MAX_RETRIES && isRetryable) {
      logger.warn(`[OCR] Retry ${retryCount + 1}/${MAX_RETRIES}: ${err.message}`);
      await sleep(RETRY_DELAY * (retryCount + 1));
      return callOCRService(filePath, filename, retryCount + 1);
    }

    logger.error(`[OCR] Failed: ${err.message}`);
    throw err;
  }
}

async function processOCR(filePath, filename) {
  logger.info(`[OCR] Sending file: ${filename}`);
  const result = await callOCRService(filePath, filename);

  if (!result.items) {
    throw new Error('OCR response missing items field');
  }

  const confidence = result.items.length > 0
    ? result.items.reduce((sum, item) => sum + (item.confidence || 0), 0) / result.items.length
    : 0;

  return {
    engine: result.engine || 'unknown',
    items: result.items,
    total: result.parsedTotal || result.items.reduce((sum, item) => sum + (item.price || 0), 0),
    ocr_confidence: confidence
  };
}

module.exports = { processOCR };