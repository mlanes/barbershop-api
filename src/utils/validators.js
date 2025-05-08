const ApiError = require('./errors/api-error');

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
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!time || !timeRegex.test(time)) {
    throw ApiError.badRequest('Invalid time format (should be HH:MM)');
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

const validateRole = (role) => {
  const validRoles = ['customer', 'barber', 'owner'];
  if (!validRoles.includes(role)) {
    throw ApiError.badRequest('Invalid role');
  }
  return true;
};

const validateAppointmentStatus = (status) => {
  const validStatuses = ['scheduled', 'completed', 'canceled'];
  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest('Invalid appointment status');
  }
  return true;
};

const validateAvailability = (availability) => {
  validateDayOfWeek(availability.day_of_week);
  validateTime(availability.start_time);
  validateTime(availability.end_time);

  // Ensure end time is after start time
  const [startHour, startMinute] = availability.start_time.split(':').map(Number);
  const [endHour, endMinute] = availability.end_time.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (endMinutes <= startMinutes) {
    throw ApiError.badRequest('End time must be after start time');
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

const validateServiceInput = (service) => {
  validateRequiredFields(service, ['name', 'duration', 'price']);
  validateDuration(service.duration);
  validatePrice(service.price);
  return true;
};

const validateAppointmentInput = (appointment) => {
  validateRequiredFields(appointment, ['barber_id', 'service_id', 'appointment_time']);
  validateDate(appointment.appointment_time);
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
  validateRequiredFields,
  validateRole,
  validateAppointmentStatus,
  validateAvailability,
  validateUserInput,
  validateServiceInput,
  validateAppointmentInput
};