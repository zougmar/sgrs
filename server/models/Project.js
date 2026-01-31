const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a project title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a project description'],
  },
  images: [{
    type: String,
  }],
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Security Cameras', 'Fire Protection', 'Access Control', 'Alarms', 'Solar Water Heaters', 'Air Conditioning', 'Maintenance'],
  },
  location: {
    type: String,
    default: '',
  },
  year: {
    type: Number,
    default: new Date().getFullYear(),
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Project', projectSchema);
