const ApiError = require('../../../utils/errors/api-error');
const { validateEmail, validatePhone, validateRequiredFields } = require('./common');

const validateBranchInput = (input) => {
  validateRequiredFields(input, ['name', 'address', 'email', 'phone']);
  validateEmail(input.email);
  validatePhone(input.phone);
  return true;
};

const validateBranchUpdate = (input) => {
  // For updates, validate fields only if they are provided
  if (input.email) validateEmail(input.email);
  if (input.phone) validatePhone(input.phone);
  return true;
};

module.exports = {
  validateBranchInput,
  validateBranchUpdate
};