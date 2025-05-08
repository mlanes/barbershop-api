const { User, Role } = require('../../../models');
const ApiError = require('../../../utils/errors/api-error');
const logger = require('../../../utils/logger');

/**
 * Register user in our database after Cognito registration
 */
const registerUser = async (req, res, next) => {
  try {
    const { full_name, email, cognito_sub, dob, phone } = req.body;

    // Validate required fields
    if (!full_name || !email || !cognito_sub) {
      throw ApiError.badRequest('Name, email and Cognito sub are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw ApiError.badRequest('User already exists');
    }

    // Get role ID
    const userRole = await Role.findOne({ where: { name: 'customer' } });
    if (!userRole) {
      throw ApiError.internal('Customer role not found');
    }

    // Create new user
    const newUser = await User.create({
      full_name,
      email,
      cognito_sub,
      dob,
      phone,
      role_id: userRole.id
    });

    logger.info('User registered successfully', { userId: newUser.id });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: userRole.name
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user information
 */
const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }
    
    res.json({
      id: req.user.id,
      full_name: req.user.full_name,
      email: req.user.email,
      dob: req.user.dob,
      phone: req.user.phone,
      role: req.user.Role.name
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  getCurrentUser
};