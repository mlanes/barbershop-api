const express = require('express');
const { isAuthenticated } = require('../../middleware/v1/auth.middleware');
const authController = require('../../controllers/v1/auth.controller');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user after Cognito registration
 * @access Public
 */
router.post('/register', authController.registerUser);

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 * @access Private
 */
router.get('/me', isAuthenticated, authController.getCurrentUser);

// For testing the auth middleware
router.get('/test', isAuthenticated, (req, res) => {
  res.json({ message: 'Authentication successful', user: req.user });
});

module.exports = router;