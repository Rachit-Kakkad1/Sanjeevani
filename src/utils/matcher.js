const Levenshtein = require('fast-levenshtein');
const ReferenceItem = require('../models/reference.model');

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function getTokens(str) {
  return str.split(/\s+/).filter(Boolean);
}

function getJaccardSimilarity(str1, str2) {
  const set1 = new Set(getTokens(str1));
  const set2 = new Set(getTokens(str2));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

function calculateConfidence(rawName, refName) {
  const normRaw = normalizeText(rawName);
  const normRef = normalizeText(refName);

  if (!normRaw || !normRef) return 0;
  if (normRaw === normRef) return 1.0;

  const jaccardScore = getJaccardSimilarity(normRaw, normRef);

  const rawCondensed = normRaw.replace(/\s+/g, '');
  const refCondensed = normRef.replace(/\s+/g, '');
  const dist = Levenshtein.get(rawCondensed, refCondensed);
  const maxLen = Math.max(rawCondensed.length, refCondensed.length);
  const levScore = maxLen === 0 ? 0 : Math.max(0, 1 - (dist / maxLen));

  return (jaccardScore * 0.6) + (levScore * 0.4);
}

function checkAliasMatch(rawName, aliases) {
  if (!aliases || aliases.length === 0) return 0;
  const normRaw = normalizeText(rawName);
  for (const alias of aliases) {
    const normAlias = normalizeText(alias);
    if (normRaw === normAlias) return 1.0;
    if (normRaw.includes(normAlias) || normAlias.includes(normRaw)) return 0.9;
  }
  return 0;
}

async function findBestMatch(rawName) {
  const normName = normalizeText(rawName);
  if (!normName) return { match: null, method: 'NONE', score: 0 };

  let candidates = await ReferenceItem.find(
    { $text: { $search: rawName } },
    { textScore: { $meta: 'textScore' } }
  ).sort({ textScore: { $meta: 'textScore' } }).limit(20).lean();

  let textSearchHit = candidates.length > 0;

  if (candidates.length === 0) {
    const regexPattern = normName.split(/\s+/).map(w => `(?=.*${w})`).join('');
    candidates = await ReferenceItem.find({
      normalizedName: { $regex: regexPattern, $options: 'i' }
    }).limit(30).lean();
  }

  if (candidates.length === 0) {
    candidates = await ReferenceItem.find({}).lean();
  }

  let bestMatch = null;
  let bestConfidence = 0;
  let bestMethod = 'NONE';

  for (const doc of candidates) {
    const nameScore = calculateConfidence(normName, doc.normalizedName);
    const aliasScore = checkAliasMatch(normName, doc.aliases);
    const confidence = Math.max(nameScore, aliasScore);

    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestMatch = doc;

      if (aliasScore > nameScore) {
        bestMethod = 'ALIAS';
      } else if (textSearchHit && confidence > 0.8) {
        bestMethod = 'TEXT_SEARCH';
      } else if (confidence > 0.7) {
        bestMethod = 'JACCARD';
      } else {
        bestMethod = 'LEVENSHTEIN';
      }
    }
  }

  if (bestConfidence < 0.5) {
    return { match: null, method: 'NONE', score: bestConfidence };
  }

  return { match: bestMatch, method: bestMethod, score: bestConfidence };
}

module.exports = { normalizeText, findBestMatch, calculateConfidence };
