const Product = require('../models/Product');
const { uploadToCloudinary } = require('../middleware/upload');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, shortDescription, price, category, stock, imageUrl, features } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, and category',
      });
    }
    
    // Parse imageUrls from FormData - FormData sends multiple values as arrays or strings
    let imageUrls = [];
    if (req.body.imageUrls) {
      if (Array.isArray(req.body.imageUrls)) {
        imageUrls = req.body.imageUrls.filter(url => url && typeof url === 'string' && url.trim() !== '');
      } else if (typeof req.body.imageUrls === 'string') {
        // Try to parse as JSON, otherwise treat as single value
        try {
          const parsed = JSON.parse(req.body.imageUrls);
          imageUrls = Array.isArray(parsed) ? parsed.filter(url => url && typeof url === 'string' && url.trim() !== '') : [req.body.imageUrls];
        } catch {
          if (req.body.imageUrls.trim() !== '') {
            imageUrls = [req.body.imageUrls];
          }
        }
      }
    }
    
    let mainImage = '';
    const galleryImages = [];
    
    // Handle main image
    if (req.files && req.files.image && req.files.image[0]) {
      const uploadResult = await uploadToCloudinary(req.files.image[0]);
      if (uploadResult && uploadResult.secure_url) {
        mainImage = uploadResult.secure_url;
      }
    } else if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      // Validate URL
      try {
        new URL(imageUrl);
        mainImage = imageUrl.trim();
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image URL',
        });
      }
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.trim() !== '' && !req.body.image.startsWith('blob:')) {
      // Handle case where image is sent as a string (existing URL)
      try {
        new URL(req.body.image);
        mainImage = req.body.image.trim();
      } catch (error) {
        // If it's not a valid URL, ignore it
        console.warn('Invalid image URL in body:', req.body.image);
      }
    }
    
    // Handle gallery images
    if (req.files && req.files.images && req.files.images.length > 0) {
      for (const file of req.files.images) {
        const uploadResult = await uploadToCloudinary(file);
        if (uploadResult && uploadResult.secure_url) {
          galleryImages.push(uploadResult.secure_url);
        }
      }
    }
    
    // Handle gallery image URLs
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      for (const url of imageUrls) {
        if (url && url.trim() !== '') {
          try {
            new URL(url);
            galleryImages.push(url);
          } catch (error) {
            // Skip invalid URLs
            console.warn('Invalid gallery image URL:', url);
          }
        }
      }
    }
    
    // Ensure price and stock are valid numbers
    const productPrice = price ? parseFloat(price) : 0;
    const productStock = stock !== undefined && stock !== null && stock !== '' ? parseInt(stock) : 0;
    
    if (isNaN(productPrice) || productPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price value',
      });
    }
    
    // Parse features from FormData
    let productFeatures = [];
    if (features) {
      if (Array.isArray(features)) {
        productFeatures = features.filter(f => f && typeof f === 'string' && f.trim() !== '');
      } else if (typeof features === 'string') {
        try {
          const parsed = JSON.parse(features);
          productFeatures = Array.isArray(parsed) ? parsed.filter(f => f && typeof f === 'string' && f.trim() !== '') : [features];
        } catch {
          if (features.trim() !== '') {
            productFeatures = [features];
          }
        }
      }
    }
    
    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      shortDescription: shortDescription ? shortDescription.trim() : description.substring(0, 100).trim(),
      price: productPrice,
      category: category.trim(),
      stock: productStock,
      features: productFeatures,
      image: mainImage,
      images: galleryImages,
    });
    
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, shortDescription, price, category, stock, imageUrl, features } = req.body;
    
    // Parse arrays from FormData - FormData sends multiple values as arrays or strings
    let imageUrls = [];
    let existingImages = [];
    
    // Handle imageUrls - can be string, array, or multiple form fields
    if (req.body.imageUrls) {
      if (Array.isArray(req.body.imageUrls)) {
        imageUrls = req.body.imageUrls.filter(url => url && typeof url === 'string' && url.trim() !== '');
      } else if (typeof req.body.imageUrls === 'string') {
        // Try to parse as JSON, otherwise treat as single value
        try {
          const parsed = JSON.parse(req.body.imageUrls);
          imageUrls = Array.isArray(parsed) ? parsed.filter(url => url && typeof url === 'string' && url.trim() !== '') : [req.body.imageUrls];
        } catch {
          if (req.body.imageUrls.trim() !== '') {
            imageUrls = [req.body.imageUrls];
          }
        }
      }
    }
    
    // Handle existingImages - can be string, array, or multiple form fields
    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        existingImages = req.body.existingImages.filter(url => url && typeof url === 'string' && url.trim() !== '');
      } else if (typeof req.body.existingImages === 'string') {
        // Try to parse as JSON, otherwise treat as single value
        try {
          const parsed = JSON.parse(req.body.existingImages);
          existingImages = Array.isArray(parsed) ? parsed.filter(url => url && typeof url === 'string' && url.trim() !== '') : [req.body.existingImages];
        } catch {
          if (req.body.existingImages.trim() !== '') {
            existingImages = [req.body.existingImages];
          }
        }
      }
    }
    
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    
    // Handle main image
    let mainImage = product.image;
    if (req.files && req.files.image && req.files.image[0]) {
      // New file uploaded
      const uploadResult = await uploadToCloudinary(req.files.image[0]);
      if (uploadResult && uploadResult.secure_url) {
        mainImage = uploadResult.secure_url;
      }
    } else if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      // New URL provided
      try {
        new URL(imageUrl);
        mainImage = imageUrl.trim();
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image URL',
        });
      }
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.trim() !== '' && !req.body.image.startsWith('blob:')) {
      // Existing image URL sent as string (from client when keeping existing image)
      try {
        new URL(req.body.image);
        mainImage = req.body.image.trim();
      } catch (error) {
        // If it's not a valid URL, keep existing image
        console.warn('Invalid image URL in body:', req.body.image);
      }
    }
    // If none of the above, mainImage stays as product.image (existing image)
    
    // Handle gallery images
    let galleryImages = [];
    
    // Start with existing images if provided
    if (existingImages && Array.isArray(existingImages) && existingImages.length > 0) {
      galleryImages = [...existingImages];
    } else if (product.images && product.images.length > 0) {
      // If no existingImages provided, keep current product images
      galleryImages = [...product.images];
    }
    
    // Add new uploaded files
    if (req.files && req.files.images && req.files.images.length > 0) {
      for (const file of req.files.images) {
        const uploadResult = await uploadToCloudinary(file);
        if (uploadResult && uploadResult.secure_url) {
          galleryImages.push(uploadResult.secure_url);
        }
      }
    }
    
    // Add new image URLs
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      for (const url of imageUrls) {
        if (url && url.trim() !== '') {
          try {
            new URL(url);
            if (!galleryImages.includes(url)) {
              galleryImages.push(url);
            }
          } catch (error) {
            console.warn('Invalid gallery image URL:', url);
          }
        }
      }
    }
    
    // Parse features from FormData
    let productFeatures = product.features || [];
    if (features !== undefined) {
      if (Array.isArray(features)) {
        productFeatures = features.filter(f => f && typeof f === 'string' && f.trim() !== '');
      } else if (typeof features === 'string') {
        try {
          const parsed = JSON.parse(features);
          productFeatures = Array.isArray(parsed) ? parsed.filter(f => f && typeof f === 'string' && f.trim() !== '') : (features.trim() !== '' ? [features] : []);
        } catch {
          productFeatures = features.trim() !== '' ? [features] : [];
        }
      }
    }
    
    // Prepare update data - ensure all fields are properly set
    const updateData = {
      name: (name !== undefined && name !== null && name !== '') ? name.trim() : product.name,
      description: (description !== undefined && description !== null && description !== '') ? description.trim() : product.description,
      shortDescription: (shortDescription !== undefined && shortDescription !== null && shortDescription !== '') ? shortDescription.trim() : (product.shortDescription || product.description.substring(0, 100)),
      price: (price !== undefined && price !== null && price !== '') ? parseFloat(price) : product.price,
      category: (category !== undefined && category !== null && category !== '') ? category.trim() : product.category,
      stock: (stock !== undefined && stock !== null && stock !== '') ? parseInt(stock) : product.stock,
      features: productFeatures,
      image: mainImage || product.image || '',
      images: galleryImages.length > 0 ? galleryImages : (product.images || []),
    };
    
    // Validate price
    if (isNaN(updateData.price) || updateData.price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price value',
      });
    }
    
    // Validate stock
    if (isNaN(updateData.stock) || updateData.stock < 0) {
      updateData.stock = 0;
    }
    
    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
    
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
};

// Bulk delete products
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product IDs to delete',
      });
    }
    
    await Product.deleteMany({ _id: { $in: productIds } });
    
    res.status(200).json({
      success: true,
      message: `${productIds.length} product(s) deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting products',
      error: error.message,
    });
  }
};
