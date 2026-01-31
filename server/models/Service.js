const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a service title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a service description'],
  },
  shortDescription: {
    type: String,
    required: [true, 'Please provide a short description'],
  },
  image: {
    type: String,
  },
  images: [{
    type: String,
  }],
  icon: {
    type: String,
    default: '🔒',
  },
  features: [{
    type: String,
  }],
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Service', serviceSchema);
