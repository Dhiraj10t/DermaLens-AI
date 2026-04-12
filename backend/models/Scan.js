const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'guest_user'
  },
  imageUrl: {
    type: String,
    required: true
  },
  acneSeverity: {
    type: String,
    enum: ['clear', 'mild', 'moderate', 'severe'],
    required: true
  },
  lesionCount: {
    type: Number,
    required: true
  },
  pigmentationLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  zones: {
    type: [String],
    required: true
  },
  recommendations: {
    type: [String],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scan', scanSchema);
