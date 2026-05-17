const mongoose = require('mongoose');

const ReferenceItemSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  normalizedName: { type: String, required: true, index: true },
  aliases: [{ type: String, index: true }],
  category: { type: String, required: true },
  standardPrice: { type: Number, required: true },
  maxAllowedPrice: { type: Number }
}, { timestamps: true });

ReferenceItemSchema.index({ normalizedName: 'text', aliases: 'text' });

module.exports = mongoose.model('ReferenceItem', ReferenceItemSchema);
