const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// USER REGISTRATION ENDPOINT
// POST /api/auth/register - Create new user account
router.post('/register', register);

// USER LOGIN ENDPOINT
// POST /api/auth/login - Authenticate user and return JWT token
router.post('/login', login);

module.exports = router;
