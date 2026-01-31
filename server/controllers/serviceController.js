const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public (shows only active) / Private (shows all)
exports.getServices = async (req, res) => {
  try {
    // If user is authenticated (admin), show all services
    // Otherwise, show only active services
    const query = req.user ? {} : { isActive: true };
    const services = await Service.find(query).sort({ order: 1 });
    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create service
// @route   POST /api/services
// @access  Private
exports.createService = async (req, res) => {
  try {
    // Handle features array from form data
    let features = [];
    if (req.body.features) {
      if (Array.isArray(req.body.features)) {
        features = req.body.features;
      } else if (typeof req.body.features === 'string') {
        features = [req.body.features];
      }
    }

    // Handle images array (gallery) - from uploaded files and URLs
    let images = [];
    
    // Add image URLs from form data
    if (req.body.imageUrls) {
      const imageUrls = Array.isArray(req.body.imageUrls) 
        ? req.body.imageUrls 
        : [req.body.imageUrls];
      
      // Filter valid URLs
      const validUrls = imageUrls.filter(url => {
        if (typeof url === 'string' && url.trim() !== '') {
          try {
            new URL(url.trim());
            return true;
          } catch (e) {
            return false;
          }
        }
        return false;
      });
      
      images = [...images, ...validUrls];
    }
    
    // Add existing images from req.body.images (URLs from existing service)
    if (req.body.images) {
      if (Array.isArray(req.body.images)) {
        const existingUrls = req.body.images.filter(img => typeof img === 'string' && !img.startsWith('blob:'));
        images = [...images, ...existingUrls];
      } else if (typeof req.body.images === 'string') {
        images = [...images, req.body.images];
      }
    }

    const serviceData = {
      ...req.body,
      features: features,
      images: images,
    };
    
    // Handle main image - can be a file (uploaded) or URL
    if (req.body.imageUrl) {
      // New URL provided
      try {
        new URL(req.body.imageUrl.trim());
        serviceData.image = req.body.imageUrl.trim();
      } catch (e) {
        // Invalid URL, ignore
      }
    } else if (req.body.image) {
      // File uploaded or existing image URL
      serviceData.image = req.body.image;
    }
    
    // Remove imageUrl and imageUrls from serviceData as they're not part of the schema
    delete serviceData.imageUrl;
    delete serviceData.imageUrls;

    const service = await Service.create(serviceData);

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create service',
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Handle features array from form data
    let features = service.features || [];
    if (req.body.features) {
      if (Array.isArray(req.body.features)) {
        features = req.body.features;
      } else if (typeof req.body.features === 'string') {
        features = [req.body.features];
      }
    }

    // Handle images array (gallery) - combine existing with new URLs
    let images = [];
    
    // Keep existing images from form data
    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        images = req.body.existingImages.filter(img => typeof img === 'string' && img.trim() !== '');
      } else if (typeof req.body.existingImages === 'string' && req.body.existingImages.trim() !== '') {
        images = [req.body.existingImages];
      }
    } else if (req.body.images) {
      // Handle existing images from req.body.images (URLs)
      if (Array.isArray(req.body.images)) {
        const existingUrls = req.body.images.filter(img => typeof img === 'string' && !img.startsWith('blob:'));
        images = existingUrls;
      } else if (typeof req.body.images === 'string') {
        images = [req.body.images];
      }
    } else {
      // Keep existing images from service
      images = service.images || [];
    }
    
    // Add new image URLs from form data
    if (req.body.imageUrls) {
      const imageUrls = Array.isArray(req.body.imageUrls) 
        ? req.body.imageUrls 
        : [req.body.imageUrls];
      
      // Filter valid URLs
      const validUrls = imageUrls.filter(url => {
        if (typeof url === 'string' && url.trim() !== '') {
          try {
            new URL(url.trim());
            return true;
          } catch (e) {
            return false;
          }
        }
        return false;
      });
      
      images = [...images, ...validUrls];
    }

    const serviceData = {
      ...req.body,
      features: features,
      images: images,
    };
    
    // Handle main image - can be a file (uploaded) or URL
    if (req.body.imageUrl) {
      // New URL provided
      try {
        new URL(req.body.imageUrl.trim());
        serviceData.image = req.body.imageUrl.trim();
      } catch (e) {
        // Invalid URL, keep existing or ignore
        if (service.image) {
          serviceData.image = service.image;
        }
      }
    } else if (req.body.image) {
      // File uploaded or existing image URL
      serviceData.image = req.body.image;
    } else if (service.image) {
      // Keep existing image
      serviceData.image = service.image;
    }
    
    // Remove imageUrl and imageUrls from serviceData as they're not part of the schema
    delete serviceData.imageUrl;
    delete serviceData.imageUrls;

    service = await Service.findByIdAndUpdate(req.params.id, serviceData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
