const express = require('express');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 *
 * components:
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Operation success status
 *         message:
 *           type: string
 *           description: Response message
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             full_name:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *
 *     RegisterInput:
 *       type: object
 *       required:
 *         - full_name
 *         - email
 *         - cognito_sub
 *         - role
 *       properties:
 *         full_name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         cognito_sub:
 *           type: string
 *         role:
 *           type: string
 *           enum: [customer, barber, owner]
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user after Cognito registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: User already exists
 */
router.post('/register', authController.registerUser);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.get('/me', isAuthenticated, authController.getCurrentUser);

// For testing the auth middleware
router.get('/test', isAuthenticated, (req, res) => {
  res.json({ message: 'Authentication successful', user: req.user });
});

module.exports = router;