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
// Make it non-blocking - let routes handle their own DB errors
const checkDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('⚠️  Database not connected, but allowing request to proceed');
  }
  next();
};

// Load routes with error handling
let authRoutesLoaded = false;
try {
  const authRouter = require('../server/routes/auth');
  app.use('/api/auth', authRouter);
  authRoutesLoaded = true;
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading auth routes:', error);
  // Create a fallback route so the app doesn't crash
  app.post('/api/auth/login', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Auth routes failed to load. Check server logs.',
      error: error.message
    });
  });
}

try {
  app.use('/api/services', checkDB, require('../server/routes/services'));
} catch (error) {
  console.error('Error loading services routes:', error);
}

try {
  app.use('/api/projects', checkDB, require('../server/routes/projects'));
} catch (error) {
  console.error('Error loading projects routes:', error);
}

try {
  app.use('/api/products', checkDB, require('../server/routes/products'));
} catch (error) {
  console.error('Error loading products routes:', error);
}

try {
  app.use('/api/contact', checkDB, require('../server/routes/contact'));
} catch (error) {
  console.error('Error loading contact routes:', error);
}

try {
  app.use('/api/orders', checkDB, require('../server/routes/orders'));
} catch (error) {
  console.error('Error loading orders routes:', error);
}

try {
  app.use('/api/users', checkDB, require('../server/routes/users'));
} catch (error) {
  console.error('Error loading users routes:', error);
}

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

// Health check (before 404 handler)
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes (must be after all routes)
app.use((req, res) => {
  console.log(`⚠️  404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    status: 'error'
  });
});

// Export the Express app as a serverless function
module.exports = app;
