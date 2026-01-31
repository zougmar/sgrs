const Project = require('../models/Project');
const { uploadToCloudinary, isCloudinaryConfigured } = require('../middleware/upload');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public (shows only active) / Private (shows all)
exports.getProjects = async (req, res) => {
  try {
    const { category } = req.query;
    // If user is authenticated (admin), show all projects
    // Otherwise, show only active projects
    const query = req.user ? {} : { isActive: true };
    
    if (category) {
      query.category = category;
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    
    // Log projects with images for debugging
    console.log(`Retrieved ${projects.length} projects`);
    projects.forEach((p, idx) => {
      console.log(`Project ${idx + 1}: ${p.title}, Images: ${p.images?.length || 0}`, p.images);
    });
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    let images = [];

    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      console.log(`Uploading ${req.files.length} image(s) to Cloudinary...`);
      for (const file of req.files) {
        try {
          if (isCloudinaryConfigured()) {
            const result = await uploadToCloudinary(file.buffer);
            images.push(result.secure_url);
            console.log('Image uploaded successfully:', result.secure_url);
          } else {
            console.warn('Cloudinary not configured, skipping image upload');
            // Don't add image if Cloudinary not configured
          }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError.message);
          // Don't add image if upload fails
        }
      }
    } else {
      console.log('No files in req.files');
    }

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
      console.log(`Added ${validUrls.length} image URL(s)`);
    }

    const projectData = {
      ...req.body,
      images: images.length > 0 ? images : [],
    };
    
    // Remove imageUrls from projectData as it's not part of the schema
    delete projectData.imageUrls;
    
    console.log('Creating project with data:', {
      ...projectData,
      images: projectData.images,
    });

    const project = await Project.create(projectData);

    console.log('Project created successfully:', project._id, 'Images:', project.images);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Handle existing images from form data
    let existingImages = [];
    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        existingImages = req.body.existingImages.filter(img => typeof img === 'string' && img.trim() !== '');
      } else if (typeof req.body.existingImages === 'string' && req.body.existingImages.trim() !== '') {
        existingImages = [req.body.existingImages];
      }
    }

    // Upload new images if provided
    const newUploadedImages = [];
    if (req.files && req.files.length > 0) {
      console.log(`Updating project: Uploading ${req.files.length} new image(s) to Cloudinary...`);
      for (const file of req.files) {
        try {
          if (isCloudinaryConfigured()) {
            const result = await uploadToCloudinary(file.buffer);
            newUploadedImages.push(result.secure_url);
            console.log('New image uploaded successfully:', result.secure_url);
          } else {
            console.warn('Cloudinary not configured, skipping image upload');
            // Don't add image if Cloudinary not configured
          }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError.message);
          // Don't add image if upload fails
        }
      }
    } else {
      console.log('No new files in req.files for update');
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
      
      newUploadedImages.push(...validUrls);
      console.log(`Added ${validUrls.length} new image URL(s)`);
    }

    // Combine existing images with newly uploaded ones
    const allImages = [...existingImages, ...newUploadedImages];

    console.log('Update project - Images:', {
      existingImages: existingImages.length,
      newUploadedImages: newUploadedImages.length,
      allImages: allImages.length,
      currentProjectImages: project.images?.length || 0
    });

    const projectData = {
      ...req.body,
      images: allImages.length > 0 ? allImages : (req.body.images !== undefined ? [] : project.images),
    };
    
    // Clean up the existingImages field as it's not part of the schema
    delete projectData.existingImages;

    console.log('Updating project with data:', {
      ...projectData,
      images: projectData.images,
    });

    project = await Project.findByIdAndUpdate(req.params.id, projectData, {
      new: true,
      runValidators: true,
    });

    console.log('Project updated successfully:', project._id, 'Images:', project.images);

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
