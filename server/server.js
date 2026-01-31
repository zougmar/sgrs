const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/products', require('./routes/products'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sgrs_security';
    
    // Connection options for better error handling and timeout management
    const options = {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout (increased for better reliability)
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      connectTimeoutMS: 30000, // 30 seconds connection timeout (increased for better reliability)
    };

    await mongoose.connect(mongoURI, options);
    console.log('✅ MongoDB Connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    
    // Provide helpful error messages
    if (err.code === 'ETIMEOUT' || err.name === 'MongoServerSelectionError') {
      console.error('\n⚠️  Connection timeout detected. Possible issues:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify MongoDB Atlas IP whitelist (if using Atlas)');
      console.error('   3. Check if MongoDB URI is correct in .env file');
      console.error('   4. Try using local MongoDB: mongodb://localhost:27017/sgrs_security');
    } else if (err.name === 'MongoParseError') {
      console.error('\n⚠️  Invalid MongoDB connection string. Check your MONGODB_URI in .env file');
    }
    
    // Don't exit in development, allow server to continue (but API calls will fail)
    console.error('\n⚠️  Server will continue running, but database operations will fail until connection is established.\n');
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
