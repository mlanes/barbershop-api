const ApiError = require('../../../utils/errors/api-error');
const { validateDayOfWeek, validateTime } = require('./common');

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

module.exports = {
  validateAvailability
};