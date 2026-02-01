const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables (Vercel will use environment variables from dashboard)
// Only load .env in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
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

// Helper function to safely load routes
const loadRoute = (routePath, routeName) => {
  try {
    const route = require(routePath);
    console.log(`✅ ${routeName} routes loaded successfully`);
    return route;
  } catch (error) {
    console.error(`❌ Error loading ${routeName} routes:`);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    return null;
  }
};

// Load routes with error handling
const authRouter = loadRoute('./routes/auth', 'Auth');
if (authRouter) {
  app.use('/api/auth', authRouter);
} else {
  // Create fallback routes if loading failed
  app.post('/api/auth/login', (req, res) => {
    console.error('Login attempt - auth routes not loaded');
    res.status(500).json({
      success: false,
      message: 'Auth routes failed to load. Please check server configuration and logs.',
    });
  });
  
  app.post('/api/auth/register', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Auth routes failed to load. Please check server configuration and logs.',
    });
  });
  
  app.post('/api/auth/create-admin', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Auth routes failed to load. Please check server configuration and logs.',
    });
  });
  
  app.get('/api/auth/me', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Auth routes failed to load. Please check server configuration and logs.',
    });
  });
}

const servicesRouter = loadRoute('./routes/services', 'Services');
if (servicesRouter) {
  app.use('/api/services', checkDB, servicesRouter);
}

const projectsRouter = loadRoute('./routes/projects', 'Projects');
if (projectsRouter) {
  app.use('/api/projects', checkDB, projectsRouter);
}

const productsRouter = loadRoute('./routes/products', 'Products');
if (productsRouter) {
  app.use('/api/products', checkDB, productsRouter);
}

const contactRouter = loadRoute('./routes/contact', 'Contact');
if (contactRouter) {
  app.use('/api/contact', checkDB, contactRouter);
}

const ordersRouter = loadRoute('./routes/orders', 'Orders');
if (ordersRouter) {
  app.use('/api/orders', checkDB, ordersRouter);
}

const usersRouter = loadRoute('./routes/users', 'Users');
if (usersRouter) {
  app.use('/api/users', checkDB, usersRouter);
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
