const express = require('express');
const router = express.Router();
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');
const { upload, uploadToCloudinary, isCloudinaryConfigured } = require('../middleware/upload');

// Optional auth middleware - attaches user if token exists, but doesn't require it
const optionalAuth = async (req, res, next) => {
  try {
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
  }
  next();
};

// Public routes (but getServices checks for auth internally to show all vs active only)
router.get('/', optionalAuth, getServices);
router.get('/:id', getService);

// Protected routes
router.post('/', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res, next) => {
  try {
    // Handle main image
    if (req.files && req.files.image && req.files.image[0]) {
      const file = req.files.image[0];
      if (isCloudinaryConfigured()) {
        try {
          const result = await uploadToCloudinary(file.buffer);
          req.body.image = result.secure_url;
        } catch (uploadError) {
          console.warn('Cloudinary upload failed:', uploadError.message);
          delete req.body.image;
        }
      } else {
        delete req.body.image;
      }
    }
    
    // Handle gallery images
    if (req.files && req.files.images && req.files.images.length > 0) {
      req.body.images = [];
      for (const file of req.files.images) {
        if (isCloudinaryConfigured()) {
          try {
            const result = await uploadToCloudinary(file.buffer);
            req.body.images.push(result.secure_url);
          } catch (uploadError) {
            console.warn('Gallery image upload failed:', uploadError.message);
          }
        }
      }
    }
    
    // If no image file uploaded and no image URL provided, don't set image
    if (!req.body.image || req.body.image === '') {
      delete req.body.image;
    }
    next();
  } catch (error) {
    console.error('Image upload error:', error);
    delete req.body.image;
    next();
  }
}, createService);

router.put('/:id', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res, next) => {
  try {
    // Handle main image
    if (req.files && req.files.image && req.files.image[0]) {
      const file = req.files.image[0];
      if (isCloudinaryConfigured()) {
        try {
          const result = await uploadToCloudinary(file.buffer);
          req.body.image = result.secure_url;
        } catch (uploadError) {
          console.warn('Cloudinary upload failed, keeping existing image:', uploadError.message);
          // If upload fails and there's an existing image URL in body, keep it
          if (!req.body.image || req.body.image === '') {
            delete req.body.image;
          }
        }
      } else {
        // If Cloudinary not configured and no image URL provided, keep existing
        if (!req.body.image || req.body.image === '') {
          delete req.body.image;
        }
      }
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.trim() !== '') {
      // If image is provided as a string (existing URL), keep it
      req.body.image = req.body.image.trim();
    } else {
      // If no new file and no image URL, don't update the image field
      delete req.body.image;
    }
    
    // Handle gallery images
    const existingImages = req.body.existingImages ? 
      (Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages]) : 
      [];
    
    if (req.files && req.files.images && req.files.images.length > 0) {
      const uploadedImages = [];
      for (const file of req.files.images) {
        if (isCloudinaryConfigured()) {
          try {
            const result = await uploadToCloudinary(file.buffer);
            uploadedImages.push(result.secure_url);
          } catch (uploadError) {
            console.warn('Gallery image upload failed:', uploadError.message);
          }
        }
      }
      // Combine existing images with newly uploaded ones
      req.body.images = [...existingImages, ...uploadedImages];
    } else if (existingImages.length > 0) {
      // If only existing images (no new uploads), use them
      req.body.images = existingImages;
    } else {
      // If no images provided, don't update the images field
      delete req.body.images;
    }
    
    // Clean up the existingImages field as it's not part of the schema
    delete req.body.existingImages;
    
    next();
  } catch (error) {
    console.error('Image upload error:', error);
    delete req.body.image;
    next();
  }
}, updateService);

router.delete('/:id', protect, deleteService);

module.exports = router;
