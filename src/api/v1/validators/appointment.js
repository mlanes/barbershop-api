const ApiError = require('../../../utils/errors/api-error');
const { validateDate, validateRequiredFields } = require('./common');

const validateAppointmentStatus = (status) => {
  const validStatuses = ['scheduled', 'completed', 'canceled'];
  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest('Invalid appointment status');
  }
  return true;
};

const validateAppointmentInput = (appointment) => {
  validateRequiredFields(appointment, ['branch_id', 'barber_id', 'service_id', 'appointment_time']);
  validateDate(appointment.appointment_time);
  return true;
};

module.exports = {
  validateAppointmentStatus,
  validateAppointmentInput
};