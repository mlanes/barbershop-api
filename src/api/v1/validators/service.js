const { validateDuration, validatePrice, validateRequiredFields } = require('./common');

const validateServiceInput = (service) => {
  validateRequiredFields(service, ['name', 'duration', 'price']);
  validateDuration(service.duration);
  validatePrice(service.price);
  return true;
};

module.exports = {
  validateServiceInput
};