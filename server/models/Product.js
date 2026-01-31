const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
  },
  shortDescription: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price'],
    min: [0, 'Price must be positive'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a product category'],
    enum: ['Cameras', 'Extincteurs', 'Climatisation', 'Alarms', 'Access Control', 'Solar Water Heaters'],
  },
  image: {
    type: String,
    default: '',
  },
  images: [{
    type: String,
  }],
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock must be positive'],
  },
  features: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
