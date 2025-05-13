const { User, Role } = require('../../../models');
const ApiError = require('../../../utils/errors/api-error');
const logger = require('../../../utils/logger');
const { validateUserInput, validateRole } = require('../validators/user');
const { successResponse, createdResponse } = require('../../../utils/response');

/**
 * Create a new user with specified role (owner only)
 */
const createUser = async (req, res, next) => {
  try {
    const { full_name, email, cognito_sub, dob, phone, role_name } = req.body;

    // Validate user input
    validateUserInput({ full_name, email, phone, dob });
    validateRole(role_name);

    if (!cognito_sub) {
      throw ApiError.badRequest('Cognito sub is required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw ApiError.badRequest('User already exists');
    }

    // Get role ID
    const userRole = await Role.findOne({ where: { name: role_name } });
    if (!userRole) {
      throw ApiError.notFound('Role not found');
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

    logger.info('User created successfully', { userId: newUser.id });

    createdResponse(res, {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      role: role_name
    }, req.startTime, 'User created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (for admin/owner)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: [{ model: Role, attributes: ['name'] }]
    });
    
    const formattedUsers = users.map(user => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      dob: user.dob,
      phone: user.phone,
      role: user.Role.name,
      created_at: user.created_at
    }));
    
    successResponse(res, formattedUsers, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if the requesting user has permission to view this user
    if (req.user.Role.name !== 'owner' && req.user.id !== parseInt(id)) {
      throw ApiError.forbidden('Access denied');
    }
    
    const user = await User.findByPk(id, {
      include: [{ model: Role, attributes: ['name'] }]
    });
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    successResponse(res, {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      dob: user.dob,
      phone: user.phone,
      role: user.Role.name,
      created_at: user.created_at
    }, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, phone, dob } = req.body;
    
    // Users can only update their own profile unless they're an owner
    if (req.user.Role.name !== 'owner' && req.user.id !== parseInt(id)) {
      throw ApiError.forbidden('Access denied');
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Validate update data
    const updateData = { full_name, phone, dob };
    if (phone) validateUserInput({ phone });
    if (dob) validateUserInput({ dob });
    
    // Update user fields
    await user.update(updateData);
    
    logger.info('User updated successfully', { userId: user.id });
    
    successResponse(res, {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      dob: user.dob
    }, req.startTime, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (admin/owner only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Don't allow deleting the last owner
    if (user.Role.name === 'owner') {
      const ownerCount = await User.count({
        include: [{
          model: Role,
          where: { name: 'owner' }
        }]
      });

      if (ownerCount <= 1) {
        throw ApiError.badRequest('Cannot delete the last owner account');
      }
    }
    
    await user.destroy();
    logger.info('User deleted successfully', { userId: id });
    
    successResponse(res, null, req.startTime, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};