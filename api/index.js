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

// Routes
app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/services', require('../server/routes/services'));
app.use('/api/projects', require('../server/routes/projects'));
app.use('/api/products', require('../server/routes/products'));
app.use('/api/contact', require('../server/routes/contact'));
app.use('/api/orders', require('../server/routes/orders'));
app.use('/api/users', require('../server/routes/users'));

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sgrs_security';
    
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };

    await mongoose.connect(mongoURI, options);
    console.log('✅ MongoDB Connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

// Connect to database
connectDB();

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: dbStatus
  });
});

// Export the Express app as a serverless function
module.exports = app;
