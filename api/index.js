// Re-export from server/api.js for Vercel deployment
// Wrap in try-catch to prevent crashes
try {
  module.exports = require('../server/api.js');
} catch (error) {
  console.error('❌ Fatal error loading server/api.js:', error);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  
  // Create a minimal Express app as fallback
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Basic health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ERROR',
      message: 'Server failed to load. Check logs.',
      error: error.message
    });
  });
  
  // All other routes return error
  app.use('/api', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Server failed to initialize. Please check server logs.',
      error: error.message
    });
  });
  
  module.exports = app;
}
