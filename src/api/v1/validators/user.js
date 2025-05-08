const ApiError = require('../../../utils/errors/api-error');
const { validateEmail, validatePhone, validateDate, validateRequiredFields } = require('./common');

const validateRole = (role) => {
  const validRoles = ['customer', 'barber', 'owner'];
  if (!validRoles.includes(role)) {
    throw ApiError.badRequest('Invalid role');
  }
  return true;
};

const validateUserInput = (user) => {
  validateRequiredFields(user, ['full_name', 'email', 'phone']);
  validateEmail(user.email);
  validatePhone(user.phone);
  if (user.dob) {
    validateDate(user.dob);
  }
  return true;
};

module.exports = {
  validateRole,
  validateUserInput
};