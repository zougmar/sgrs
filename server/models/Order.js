const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    default: function() {
      return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    },
  },
  customer: {
    fullName: {
      type: String,
      required: [true, 'Please provide customer full name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide customer email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide customer phone'],
    },
    address: {
      type: String,
      required: [true, 'Please provide customer address'],
    },
    city: {
      type: String,
      required: [true, 'Please provide customer city'],
    },
    postalCode: {
      type: String,
      default: '',
    },
  },
  items: [{
    productId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
  }],
  total: {
    type: Number,
    required: [true, 'Please provide order total'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
