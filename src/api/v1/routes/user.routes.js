const express = require('express');
const { isAuthenticated, isOwner } = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

/**
 * @route POST /api/users
 * @desc Create a new user with specified role (owner only)
 * @access Private/Owner
 */
router.post('/', isOwner, userController.createUser);

/**
 * @route GET /api/users
 * @desc Get all users (for admin/owner only)
 * @access Private/Owner
 */
router.get('/', isOwner, userController.getAllUsers);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/:id', isAuthenticated, userController.getUserById);

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Private
 */
router.put('/:id', isAuthenticated, userController.updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private/Owner
 */
router.delete('/:id', isOwner, userController.deleteUser);

module.exports = router;