const express = require('express');
const router = express.Router();
const { register, login, getMe, createFirstAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/create-admin', createFirstAdmin);
router.get('/me', protect, getMe);

module.exports = router;
