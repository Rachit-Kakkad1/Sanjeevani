const mongoose = require('mongoose');

const FileCacheSchema = new mongoose.Schema({
  fileHash: { type: String, required: true, unique: true, index: true },
  ocrData: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now, expires: 2592000 }
});

module.exports = mongoose.model('FileCache', FileCacheSchema);
