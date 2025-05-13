const { Appointment, User, Barber, Service, BarberAvailability, Branch } = require('../../../models');
const { Op } = require('sequelize');
const ApiError = require('../../../utils/errors/api-error');
const logger = require('../../../utils/logger');
const { validateAppointmentInput, validateAppointmentStatus } = require('../validators/appointment');
const { validateRequiredFields, validateDate } = require('../validators/common');
const { successResponse, createdResponse } = require('../../../utils/response');

/**
 * Get appointments based on user role
 */
const getAppointments = async (req, res, next) => {
  try {
    let where = {};
    const userRole = req.user.Role.name;
    
    // Filter appointments based on user role
    if (userRole === 'customer') {
      where.customer_id = req.user.id;
    } else if (userRole === 'barber') {
      const barber = await Barber.findOne({ where: { user_id: req.user.id } });
      if (!barber) {
        throw ApiError.notFound('Barber profile not found');
      }
      where.barber_id = barber.id;
    }
    
    const appointments = await Appointment.findAll({
      where,
      include: [
        {
          model: User,
          as: 'Customer',
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: Barber,
          include: [{
            model: User,
            attributes: ['id', 'full_name', 'email', 'phone']
          }]
        },
        { model: Service },
        { model: Branch }
      ],
      order: [['appointment_time', 'DESC']]
    });
    
    successResponse(res, appointments, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointment by ID
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Customer',
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: Barber,
          include: [{
            model: User,
            attributes: ['id', 'full_name', 'email', 'phone']
          }]
        },
        { model: Service }
      ]
    });
    
    if (!appointment) {
      throw ApiError.notFound('Appointment not found');
    }
    
    // Check if user is authorized to view this appointment
    const userRole = req.user.Role.name;
    
    if (userRole === 'customer' && appointment.customer_id !== req.user.id) {
      throw ApiError.forbidden('Not authorized to view this appointment');
    }
    
    if (userRole === 'barber') {
      const barber = await Barber.findOne({ where: { user_id: req.user.id } });
      if (!barber || appointment.barber_id !== barber.id) {
        throw ApiError.forbidden('Not authorized to view this appointment');
      }
    }
    
    successResponse(res, appointment, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new appointment
 */
const createAppointment = async (req, res, next) => {
  try {
    const { branch_id, barber_id, service_id, appointment_time } = req.body;
    
    // Validate appointment input
    validateAppointmentInput({ branch_id, barber_id, service_id, appointment_time });
    
    // Check if branch exists
    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }

    // Check if the barber exists and belongs to the branch
    const barber = await Barber.findOne({
      where: { 
        id: barber_id,
        branch_id,
        is_active: true
      }
    });
    if (!barber) {
      throw ApiError.notFound('Barber not found or not associated with this branch');
    }

    // Check if the service exists and belongs to the branch
    const service = await Service.findOne({
      where: {
        id: service_id,
        branch_id,
        is_active: true
      }
    });
    if (!service) {
      throw ApiError.notFound('Service not found or not available at this branch');
    }
    
    // Check if the slot is available
    const existingAppointment = await Appointment.findOne({
      where: {
        barber_id,
        appointment_time,
        status: { [Op.ne]: 'canceled' }
      }
    });
    
    if (existingAppointment) {
      throw ApiError.badRequest('This time slot is already booked');
    }
    
    // Check if the barber is available on this day/time
    const appointmentDate = new Date(appointment_time);
    const dayOfWeek = appointmentDate.getDay();
    
    const barberAvailability = await BarberAvailability.findOne({
      where: {
        barber_id,
        day_of_week: dayOfWeek
      }
    });
    
    if (!barberAvailability) {
      throw ApiError.badRequest('Barber is not available on this day');
    }
    
    // Check if the appointment time is within barber's working hours
    const appointmentHours = appointmentDate.getHours();
    const appointmentMinutes = appointmentDate.getMinutes();
    const appointmentTimeInMinutes = appointmentHours * 60 + appointmentMinutes;
    
    const startTimeArray = barberAvailability.start_time.split(':');
    const startTimeInMinutes = parseInt(startTimeArray[0]) * 60 + parseInt(startTimeArray[1]);
    
    const endTimeArray = barberAvailability.end_time.split(':');
    const endTimeInMinutes = parseInt(endTimeArray[0]) * 60 + parseInt(endTimeArray[1]);
    
    if (appointmentTimeInMinutes < startTimeInMinutes || 
        appointmentTimeInMinutes + service.duration > endTimeInMinutes) {
      throw ApiError.badRequest('Appointment time is outside barber working hours');
    }
    
    // Create appointment
    const appointment = await Appointment.create({
      branch_id,
      customer_id: req.user.id,
      barber_id,
      service_id,
      appointment_time,
      status: 'scheduled'
    });
    
    logger.info('Appointment created', { 
      appointmentId: appointment.id,
      customerId: req.user.id,
      barberId: barber_id 
    });
    
    // Fetch the complete appointment with associations
    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: User,
          as: 'Customer',
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: Barber,
          include: [{
            model: User,
            attributes: ['id', 'full_name', 'email', 'phone']
          }]
        },
        { model: Service }
      ]
    });
    
    createdResponse(res, createdAppointment, req.startTime, 'Appointment created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment
 */
const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { appointment_time, service_id } = req.body;
    
    validateRequiredFields({ appointment_time }, ['appointment_time']);
    if (appointment_time) validateDate(appointment_time);
    
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      throw ApiError.notFound('Appointment not found');
    }
    
    // Customers can only update their own appointments
    if (req.user.Role.name === 'customer' && appointment.customer_id !== req.user.id) {
      throw ApiError.forbidden('Not authorized to update this appointment');
    }
    
    // Barbers can only update appointments they're assigned to
    if (req.user.Role.name === 'barber') {
      const barber = await Barber.findOne({ where: { user_id: req.user.id } });
      if (!barber || appointment.barber_id !== barber.id) {
        throw ApiError.forbidden('Not authorized to update this appointment');
      }
    }
    
    // Only allow updates if appointment is still scheduled
    if (appointment.status !== 'scheduled') {
      throw ApiError.badRequest('Cannot update appointment that is already completed or canceled');
    }
    
    // If changing time, check for conflicts
    if (appointment_time && appointment_time !== appointment.appointment_time) {
      const existingAppointment = await Appointment.findOne({
        where: {
          barber_id: appointment.barber_id,
          appointment_time,
          status: { [Op.ne]: 'canceled' },
          id: { [Op.ne]: id }
        }
      });
      
      if (existingAppointment) {
        throw ApiError.badRequest('This time slot is already booked');
      }
    }
    
    // Update appointment
    await appointment.update({
      appointment_time: appointment_time || appointment.appointment_time,
      service_id: service_id || appointment.service_id
    });
    
    logger.info('Appointment updated', { appointmentId: id });
    
    // Fetch the updated appointment with associations
    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Customer',
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: Barber,
          include: [{
            model: User,
            attributes: ['id', 'full_name', 'email', 'phone']
          }]
        },
        { model: Service }
      ]
    });
    
    successResponse(res, updatedAppointment, req.startTime, 'Appointment updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment status
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    validateRequiredFields({ status }, ['status']);
    validateAppointmentStatus(status);
    
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      throw ApiError.notFound('Appointment not found');
    }
    
    // Only barbers and owners can change status
    if (req.user.Role.name === 'barber') {
      const barber = await Barber.findOne({ where: { user_id: req.user.id } });
      if (!barber || appointment.barber_id !== barber.id) {
        throw ApiError.forbidden('Not authorized to update this appointment');
      }
    }
    
    // Update status
    await appointment.update({ status });
    
    logger.info('Appointment status updated', { 
      appointmentId: id, 
      newStatus: status 
    });
    
    successResponse(res, appointment, req.startTime, 'Appointment status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel appointment
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      throw ApiError.notFound('Appointment not found');
    }
    
    // Customers can only cancel their own appointments
    if (req.user.Role.name === 'customer' && appointment.customer_id !== req.user.id) {
      throw ApiError.forbidden('Not authorized to cancel this appointment');
    }
    
    // Only allow cancellation if appointment is still scheduled
    if (appointment.status !== 'scheduled') {
      throw ApiError.badRequest('Cannot cancel appointment that is already completed or canceled');
    }
    
    // Update status to canceled
    await appointment.update({ status: 'canceled' });
    
    logger.info('Appointment canceled', { appointmentId: id });
    
    successResponse(res, null, req.startTime, 'Appointment canceled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get available appointment slots
 */
const getAvailableSlots = async (req, res, next) => {
  try {
    const { branch_id, barber_id, date, service_id } = req.query;
    
    validateRequiredFields({ branch_id, barber_id, date }, ['branch_id', 'barber_id', 'date']);
    validateDate(date);

    // Check if branch exists
    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }

    // Check if barber belongs to branch
    const barber = await Barber.findOne({
      where: { 
        id: barber_id,
        branch_id,
        is_active: true
      }
    });
    if (!barber) {
      throw ApiError.notFound('Barber not found or not associated with this branch');
    }

    // If service_id provided, check if it belongs to branch
    if (service_id) {
      const service = await Service.findOne({
        where: {
          id: service_id,
          branch_id,
          is_active: true
        }
      });
      if (!service) {
        throw ApiError.notFound('Service not found or not available at this branch');
      }
    }
    
    // Get the day of week from the date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    
    // Check barber availability for this day
    const availability = await BarberAvailability.findOne({
      where: {
        barber_id,
        day_of_week: dayOfWeek
      }
    });
    
    if (!availability) {
      return successResponse(res, { 
        barber_id,
        date,
        service_id,
        available_slots: []
      }, req.startTime, 'Barber is not available on this day');
    }
    
    // Get service duration
    let serviceDuration = 30; // Default 30 minutes
    if (service_id) {
      const service = await Service.findByPk(service_id);
      if (service) {
        serviceDuration = service.duration;
      }
    }
    
    // Get existing appointments for this barber on this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingAppointments = await Appointment.findAll({
      where: {
        barber_id,
        appointment_time: {
          [Op.between]: [startOfDay, endOfDay]
        },
        status: { [Op.ne]: 'canceled' }
      },
      include: [{ model: Service }]
    });
    
    // Calculate busy slots
    const busySlots = existingAppointments.map(appointment => {
      const startTime = new Date(appointment.appointment_time);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + appointment.Service.duration);
      
      return {
        start: startTime,
        end: endTime
      };
    });
    
    // Parse availability times
    const startTimeArray = availability.start_time.split(':');
    const startHour = parseInt(startTimeArray[0]);
    const startMinute = parseInt(startTimeArray[1]);
    
    const endTimeArray = availability.end_time.split(':');
    const endHour = parseInt(endTimeArray[0]);
    const endMinute = parseInt(endTimeArray[1]);
    
    // Generate all possible slots
    const slots = [];
    const slotInterval = 30; // 30-minute slots
    
    const startDateTime = new Date(date);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(date);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    // Subtract service duration from end time to ensure last appointment fits
    endDateTime.setMinutes(endDateTime.getMinutes() - serviceDuration);
    
    let currentSlot = new Date(startDateTime);
    
    while (currentSlot <= endDateTime) {
      // Check if this slot is available
      const slotEndTime = new Date(currentSlot);
      slotEndTime.setMinutes(slotEndTime.getMinutes() + serviceDuration);
      
      const isSlotBusy = busySlots.some(busySlot => {
        // Check if there's any overlap
        return (
          (currentSlot >= busySlot.start && currentSlot < busySlot.end) ||
          (slotEndTime > busySlot.start && slotEndTime <= busySlot.end) ||
          (currentSlot <= busySlot.start && slotEndTime >= busySlot.end)
        );
      });
      
      if (!isSlotBusy) {
        slots.push(new Date(currentSlot));
      }
      
      // Move to next slot
      currentSlot.setMinutes(currentSlot.getMinutes() + slotInterval);
    }
    
    successResponse(res, {
      barber_id,
      date,
      service_id,
      available_slots: slots
    }, req.startTime);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAvailableSlots
};