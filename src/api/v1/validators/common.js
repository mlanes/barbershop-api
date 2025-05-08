const ApiError = require('../../../utils/errors/api-error');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw ApiError.badRequest('Invalid email format');
  }
  return true;
};

const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phone || !phoneRegex.test(phone)) {
    throw ApiError.badRequest('Invalid phone number format');
  }
  return true;
};

const validateDate = (date) => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw ApiError.badRequest('Invalid date format');
  }
  return true;
};

const validateTime = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  if (!time || !timeRegex.test(time)) {
    throw ApiError.badRequest('Invalid time format (should be HH:MM:SS)');
  }
  return true;
};

const validateDayOfWeek = (day) => {
  const dayNumber = parseInt(day);
  if (isNaN(dayNumber) || dayNumber < 0 || dayNumber > 6) {
    throw ApiError.badRequest('Day of week must be a number between 0 and 6');
  }
  return true;
};

const validatePrice = (price) => {
  const priceNumber = parseFloat(price);
  if (isNaN(priceNumber) || priceNumber < 0) {
    throw ApiError.badRequest('Price must be a positive number');
  }
  return true;
};

const validateDuration = (duration) => {
  const durationNumber = parseInt(duration);
  if (isNaN(durationNumber) || durationNumber <= 0) {
    throw ApiError.badRequest('Duration must be a positive number');
  }
  return true;
};

const validateRequiredFields = (obj, fields) => {
  const missingFields = fields.filter(field => !obj[field]);
  if (missingFields.length > 0) {
    throw ApiError.badRequest(`Missing required fields: ${missingFields.join(', ')}`);
  }
  return true;
};

module.exports = {
  validateEmail,
  validatePhone,
  validateDate,
  validateTime,
  validateDayOfWeek,
  validatePrice,
  validateDuration,
  validateRequiredFields
};