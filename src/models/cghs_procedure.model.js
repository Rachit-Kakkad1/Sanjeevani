const mongoose = require('mongoose');

// TODO: optimize text search indexes
const cghsProcedureSchema = new mongoose.Schema({
  source: { type: String, default: 'CGHS' },
  serialNumber: Number,
  code: { type: String, index: true },
  canonicalName: { type: String, required: true, index: true },
  aliases: [String],
  nonNABH: Number,
  NABH: Number,
  superSpeciality: Number,
  classification: String,
  sourceFile: String,
  ingestedAt: Date,
  matchData: {
    normalizedTokens: [String],
    aliasTokens: [String],
    searchableText: String
  }
}, { 
  collection: 'cghs_procedures',
  timestamps: true,
  strict: false   // Allow fields not in schema to pass through
});

// Index for text search
cghsProcedureSchema.index({ canonicalName: 'text', aliases: 'text' });

const CGHSProcedure = mongoose.model('CGHSProcedure', cghsProcedureSchema);

module.exports = CGHSProcedure;

