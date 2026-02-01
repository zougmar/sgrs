const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} = require('../controllers/productController');
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

// Public routes (GET requests don't require authentication)
router.get('/', optionalAuth, getProducts);
router.get('/:id', getProduct);

// Protected routes (POST, PUT, DELETE require authentication)
router.post('/', protect, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), createProduct);

router.post('/bulk-delete', protect, bulkDeleteProducts);

router.put('/:id', protect, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), updateProduct);

router.delete('/:id', protect, deleteProduct);

module.exports = router;
