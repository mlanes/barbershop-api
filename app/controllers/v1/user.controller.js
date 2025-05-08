const { User, Role } = require('../../models');

/**
 * Create a new user with specified role (owner only)
 */
const createUser = async (req, res) => {
  try {
    const { full_name, email, cognito_sub, dob, phone, role_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get role ID
    const userRole = await Role.findOne({ where: { name: role_name } });
    if (!userRole) {
      return res.status(400).json({ message: 'Invalid role' });
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

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: role_name
      }
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ message: 'User creation failed', error: error.message });
  }
};

/**
 * Get all users (for admin/owner)
 */
const getAllUsers = async (req, res) => {
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
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the requesting user has permission to view this user
    if (req.user.Role.name !== 'owner' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findByPk(id, {
      include: [{ model: Role, attributes: ['name'] }]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      dob: user.dob,
      phone: user.phone,
      role: user.Role.name,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

/**
 * Update user
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, dob } = req.body;
    
    // Users can only update their own profile unless they're an owner
    if (req.user.Role.name !== 'owner' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
    await user.update({
      full_name: full_name || user.full_name,
      phone: phone || user.phone,
      dob: dob || user.dob
    });
    
    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        dob: user.dob
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

/**
 * Delete user (admin/owner only)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};