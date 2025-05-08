const { User, Role } = require('../../models');

// This controller contains placeholder methods as actual authentication
// is handled by AWS Cognito. These methods are for user registration in our database
// after successful Cognito authentication.

/**
 * Register user in our database after Cognito registration
 */
const registerUser = async (req, res) => {
  try {
    const { full_name, email, cognito_sub, dob, phone  } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get role ID
    const userRole = await Role.findOne({ where: { name: 'customer' } });
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
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

/**
 * Get current authenticated user information
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      dob: user.dob,
      phone: user.phone,
      role: user.Role.name
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Error fetching user information' });
  }
};

module.exports = {
  registerUser,
  getCurrentUser
};