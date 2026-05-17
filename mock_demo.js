const Fuse = require('fuse.js');
const { normalizeMedicalText } = require('./src/services/matcher');

// Mock Data representing what's in MongoDB
const mockProcedures = [
  {
    code: "RI009",
    canonicalName: "CT Coronary Angiography including Calcium Score Test",
    aliases: ["ct cor angio", "coronary angiography"],
    pricing: { tier1: { nonNABH: 7820, NABH: 9200, superSpeciality: 9200 } },
    classification: "Radiological Investigation"
  },
  {
    code: "RI056",
    canonicalName: "MRI Brain with Contrast",
    aliases: ["mri brain contrast", "mri brain w contrast"],
    pricing: { tier1: { nonNABH: 5000, NABH: 6000, superSpeciality: 6000 } },
    classification: "Radiological Investigation"
  },
  {
    code: "LT001",
    canonicalName: "Complete Blood Count",
    aliases: ["cbc", "blood count"],
    pricing: { tier1: { nonNABH: 250, NABH: 300, superSpeciality: 300 } },
    classification: "Laboratory Test"
  }
];

// Re-implementing findBestProcedureMatch logic for mock test
const mockFindBestProcedureMatch = async (extractedText) => {
  const proceduresCache = mockProcedures.map(p => ({
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

  const fuseInstance = new Fuse(proceduresCache, options);
  const normalizedInput = normalizeMedicalText(extractedText);
  const results = fuseInstance.search(normalizedInput);

  if (results.length === 0) return { matched: false, confidence: 0, matchedProcedure: null };

  const bestResult = results[0];
  const confidence = 1 - bestResult.score;
  const matchedProc = bestResult.item;

  const inputTokens = new Set(normalizedInput.split(' '));
  const canonicalTokens = new Set(matchedProc.searchableName.split(' '));
  const intersection = new Set([...inputTokens].filter(x => canonicalTokens.has(x)));
  const overlapBonus = (intersection.size / Math.max(inputTokens.size, canonicalTokens.size)) * 0.1;
  
  let finalConfidence = Math.min(0.99, confidence + overlapBonus);

  return {
    matched: finalConfidence > 0.6,
    confidence: parseFloat(finalConfidence.toFixed(2)),
    matchedProcedure: {
      code: matchedProc.code,
      canonicalName: matchedProc.canonicalName,
      nonNABH: matchedProc.pricing?.tier1?.nonNABH || 0,
      NABH: matchedProc.pricing?.tier1?.NABH || 0,
      superSpeciality: matchedProc.pricing?.tier1?.superSpeciality || 0,
      classification: matchedProc.classification
    }
  };
};

// Re-implementing audit logic for mock test
const mockGenerateAuditReport = async (items) => {
  const auditResults = [];
  let totalBilled = 0;
  let totalAllowed = 0;
  let totalSavingPotential = 0;

  for (const item of items) {
    const rawName = item.name;
    const billedAmount = item.amount || 0;
    totalBilled += billedAmount;

    const matchResult = await mockFindBestProcedureMatch(rawName);

    if (matchResult.matched) {
      const proc = matchResult.matchedProcedure;
      const officialRate = proc.NABH || proc.nonNABH || 0;
      const difference = billedAmount - officialRate;
      const potentialOvercharge = difference > 0;

      auditResults.push({
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
      });

      totalAllowed += officialRate;
      if (potentialOvercharge) totalSavingPotential += difference;
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
        reason: "No corresponding CGHS procedure could be identified with sufficient confidence."
      });
      totalAllowed += billedAmount; 
    }
  }

  return {
    summary: {
      totalItems: items.length,
      totalBilled,
      totalAllowed,
      totalSavingPotential,
      savingsPercentage: totalBilled > 0 ? parseFloat(((totalSavingPotential / totalBilled) * 100).toFixed(2)) : 0,
    },
    items: auditResults
  };
};

// TODO: remove this mock script before final demo
async function runMockDemo() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 MEDCLEAR AUDIT ENGINE - MOCK DEMONSTRATION');
  console.log('='.repeat(60));

  console.log('\n--- 1. Normalization Example ---');
  const rawTexts = ["CT COR ANGIO", "MRI BRAIN W/CONTRAST", "CBC"];
  rawTexts.forEach(t => {
    console.log(`Original: "${t}" -> Normalized: "${normalizeMedicalText(t)}"`);
  });

  console.log('\n--- 2. Successful Match Example ---');
  const matchResult = await mockFindBestProcedureMatch("CT COR ANGIO");
  console.log(JSON.stringify(matchResult, null, 2));

  console.log('\n--- 3. Full Audit Example ---');
  const billItems = [
    { name: "CT COR ANGIO", amount: 24000 },
    { name: "MRI BRAIN W/CONTRAST", amount: 15000 },
    { name: "COMPLETE BLOOD COUNT", amount: 1200 }
  ];
  const report = await mockGenerateAuditReport(billItems);
  console.log(JSON.stringify(report, null, 2));
}

runMockDemo();
