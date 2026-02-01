const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables (Vercel will use environment variables from dashboard)
// Only load .env in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to check database connection for routes that need it
const checkDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available. Please check MONGODB_URI environment variable.',
      error: 'Database disconnected'
    });
  }
  next();
};

// Routes that don't need database (auth might work without DB for some operations)
app.use('/api/auth', require('../server/routes/auth'));

// Routes that need database - add checkDB middleware
app.use('/api/services', checkDB, require('../server/routes/services'));
app.use('/api/projects', checkDB, require('../server/routes/projects'));
app.use('/api/products', checkDB, require('../server/routes/products'));
app.use('/api/contact', checkDB, require('../server/routes/contact'));
app.use('/api/orders', checkDB, require('../server/routes/orders'));
app.use('/api/users', checkDB, require('../server/routes/users'));

// MongoDB Connection
const connectDB = async () => {
  try {
    // Don't reconnect if already connected
    if (mongoose.connection.readyState === 1) {
      return;
    }

    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      return;
    }
    
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };

    await mongoose.connect(mongoURI, options);
    console.log('✅ MongoDB Connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

// Connect to database
connectDB();

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: 'error'
  });
});

// Export the Express app as a serverless function
module.exports = app;
