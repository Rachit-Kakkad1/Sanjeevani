const Fuse = require('fuse.js');
const CGHSProcedure = require('../models/cghs_procedure.model');
const logger = require('../utils/logger');

let fuseInstance = null;
let proceduresCache = [];

/**
 * Normalizes medical text for better matching
 * @param {string} text 
 * @returns {string}
 */
const normalizeMedicalText = (text) => {
  if (!text) return '';
  
  let normalized = text.toLowerCase();
  
  // OCR Cleanup & Punctuation Removal
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');
  
  // Abbreviation Normalization
  const abbreviations = {
    'cor': 'coronary',
    'angio': 'angiography',
    'w/contrast': 'contrast',
    'w/o': 'without',
    'abd': 'abdomen',
    'pel': 'pelvis',
    'ext': 'extremity',
    'bilat': 'bilateral',
    'unilat': 'unilateral',
    'inj': 'injection',
    'cons': 'consultation',
    'invest': 'investigation',
    'rad': 'radiological',
    'usg': 'ultrasound',
    'cxr': 'chest x-ray',
    'kft': 'kidney function test',
    'lft': 'liver function test',
    'cbc': 'complete blood count'
  };

  Object.keys(abbreviations).forEach(abbr => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'g');
    normalized = normalized.replace(regex, abbreviations[abbr]);
  });

  // Whitespace cleanup
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

/**
 * Initializes the Fuse.js index by fetching data from MongoDB
 */
// TODO: load synonyms from db
const initMatcher = async () => {
  try {
    logger.info('Initializing Sanjeevani Matcher Engine...');
    const procedures = await CGHSProcedure.find({}).lean();
    
    // Flatten pricing for easier access if needed, 
    // but we'll keep the original structure for the match output
    proceduresCache = procedures.map(p => ({
      ...p,
      searchableName: normalizeMedicalText(p.canonicalName),
      searchableAliases: (p.aliases || []).map(a => normalizeMedicalText(a))
    }));

    const options = {
      keys: [
        { name: 'canonicalName', weight: 0.7 },
        { name: 'searchableName', weight: 0.9 },
        { name: 'aliases', weight: 0.5 },
        { name: 'classification', weight: 0.3 }
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
      useExtendedSearch: true
    };

    fuseInstance = new Fuse(proceduresCache, options);
    logger.info(`Matcher Engine initialized with ${proceduresCache.length} procedures.`);
  } catch (error) {
    logger.error('Failed to initialize Matcher Engine:', error);
  }
};

/**
 * Finds the best match for a given raw text
 * @param {string} extractedText 
 * @returns {Object}
 */
const findBestProcedureMatch = async (extractedText) => {
  if (!fuseInstance) {
    await initMatcher();
  }

  const normalizedInput = normalizeMedicalText(extractedText);
  const results = fuseInstance.search(normalizedInput);

  if (results.length === 0) {
    // Fallback: Token-based partial matching if no Fuse.js results
    return {
      matched: false,
      confidence: 0,
      matchedProcedure: null,
      reason: 'No matching procedure found.'
    };
  }

  const bestResult = results[0];
  const confidence = 1 - bestResult.score; // Fuse.js score is 0 for perfect match

  // Additional scoring logic
  let finalConfidence = confidence;
  const matchedProc = bestResult.item;

  // Exact keyword overlap bonus
  const inputTokens = new Set(normalizedInput.split(' '));
  const canonicalTokens = new Set(matchedProc.searchableName.split(' '));
  const intersection = new Set([...inputTokens].filter(x => canonicalTokens.has(x)));
  const overlapBonus = (intersection.size / Math.max(inputTokens.size, canonicalTokens.size)) * 0.1;
  
  finalConfidence = Math.min(0.99, finalConfidence + overlapBonus);

  return {
    matched: finalConfidence > 0.6,
    confidence: parseFloat(finalConfidence.toFixed(2)),
    matchedProcedure: {
      code: matchedProc.code,
      canonicalName: matchedProc.canonicalName,
      nonNABH: matchedProc.nonNABH || matchedProc.pricing?.tier1?.nonNABH || 0,
      NABH: matchedProc.NABH || matchedProc.pricing?.tier1?.NABH || 0,
      superSpeciality: matchedProc.superSpeciality || matchedProc.pricing?.tier1?.superSpeciality || 0,
      classification: matchedProc.classification
    }
  };
};

module.exports = {
  normalizeMedicalText,
  findBestProcedureMatch,
  initMatcher
};
