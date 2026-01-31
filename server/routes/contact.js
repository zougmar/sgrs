const express = require('express');
const router = express.Router();
const {
  createContact,
  getContacts,
  getContact,
  deleteContact,
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// Public route
router.post('/', createContact);

// Protected routes
router.get('/', protect, getContacts);
router.get('/:id', protect, getContact);
router.delete('/:id', protect, deleteContact);

module.exports = router;
