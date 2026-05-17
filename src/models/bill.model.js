const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema({
  rawName: { type: String, required: true },
  matchedReference: { type: mongoose.Schema.Types.ObjectId, ref: 'ReferenceItem' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  isOvercharged: { type: Boolean, default: false },
  overchargeAmount: { type: Number, default: 0 },
  matchMethod: { type: String, enum: ['TEXT_SEARCH', 'REGEX', 'LEVENSHTEIN', 'JACCARD', 'ALIAS', 'NONE'], default: 'NONE' },
  ocrConfidence: { type: Number, default: 0 },
  matchConfidence: { type: Number, default: 0 }
});

const BillSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED_OCR', 'FAILED_MATCH', 'TIMEOUT'],
    default: 'QUEUED'
  },
  hospitalName: { type: String },
  items: [BillItemSchema],
  totalCharged: { type: Number, default: 0 },
  calculatedTotal: { type: Number, default: 0 },
  totalOvercharge: { type: Number, default: 0 },
  auditDate: { type: Date, default: Date.now },
  error: { type: String },
  timings: {
    uploadMs: { type: Number },
    queueWaitMs: { type: Number },
    ocrMs: { type: Number },
    matchMs: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('Bill', BillSchema);
