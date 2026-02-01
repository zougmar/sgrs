const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const mongoose = require('mongoose');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create first admin user (if no users exist)
// @route   POST /api/auth/create-admin
// @access  Public (only works if database is empty)
exports.createFirstAdmin = async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Please check MONGODB_URI environment variable.',
      });
    }

    // Check if any users exist
    let userCount;
    try {
      userCount = await User.countDocuments();
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(503).json({
        success: false,
        message: 'Database connection error. Please check your MongoDB connection.',
        error: dbError.message,
      });
    }
    
    if (userCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Admin user already exists. Use /api/auth/register to create additional users.',
      });
    }

    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password',
      });
    }

    // Create admin user
    let admin;
    try {
      admin = await User.create({
        username,
        email,
        password,
        role: 'admin',
      });
    } catch (createError) {
      console.error('Error creating admin user:', createError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create admin user',
        error: createError.message,
      });
    }

    // Generate token
    let token;
    try {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          success: false,
          message: 'JWT_SECRET not configured. Please set JWT_SECRET environment variable.',
        });
      }
      token = generateToken(admin._id);
    } catch (tokenError) {
      console.error('Error generating token:', tokenError);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate authentication token',
        error: tokenError.message,
      });
    }

    res.status(201).json({
      success: true,
      message: 'First admin user created successfully',
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Unexpected error in createFirstAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
