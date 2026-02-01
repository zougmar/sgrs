const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { upload, uploadToCloudinary, isCloudinaryConfigured } = require('../middleware/upload');

// Optional auth middleware - attaches user if token exists, but doesn't require it
const optionalAuth = async (req, res, next) => {
  try {
    // Skip auth if JWT_SECRET is not configured
    if (!process.env.JWT_SECRET) {
      return next();
    }

    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Invalid token, continue without user
      }
    }
  } catch (error) {
    // Ignore errors for optional auth
    console.warn('Optional auth error (non-critical):', error.message);
  }
  next();
};

// Public routes (but getProjects checks for auth internally to show all vs active only)
router.get('/', optionalAuth, getProjects);
router.get('/:id', getProject);

// Protected routes
router.post('/', protect, upload.array('images', 10), createProject);
router.put('/:id', protect, upload.array('images', 10), updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;
