const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  minIncome: {
    type: Number,
    default: 0,
  },
  maxIncome: {
    type: Number,
    required: true,
  },
  states: {
    type: [String],
    default: [], // Empty implies all states (national scheme)
  },
  benefits: {
    type: [String],
    default: [],
  },
  coverageAmount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Scheme = mongoose.model('Scheme', schemeSchema);

module.exports = Scheme;
