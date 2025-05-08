const { Appointment, User, Barber, Service, BarberAvailability } = require('../../../models');
const { Op } = require('sequelize');

/**
 * Get appointments based on user role
 */
const getAppointments = async (req, res) => {
  try {
    let where = {};
    const userRole = req.user.Role.name;
    
    // Filter appointments based on user role
    if (userRole === 'customer') {
      // Customers can only see their own appointments
      where.customer_id = req.user.id;
    } else if (userRole === 'barber') {
      // Barbers can only see appointments they're assigned to
      const barber = await Barber.findOne({ where: { user_id: req.user.id } });
      if (!barber) {
        return res.status(404).json({ message: 'Barber profile not found' });
      }
      where.barber_id = barber.id;
    }
    // Owners can see all appointments (no additional filter)
    
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
        { model: Service }
      ],
      order: [['appointment_time', 'DESC']]
    });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

/**
 * Get appointment by ID
 */
const getAppointmentById = async (req, res) => {
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
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if user is authorized to view this appointment
    const userRole = req.user.Role.name;
    
    if (userRole === 'customer' && appointment.customer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }
    
    if (userRole === 'barber') {
      const barber = await Barber.findOne({ where: { user_id: req.user.id } });
      if (!barber || appointment.barber_id !== barber.id) {
        return res.status(403).json({ message: 'Not authorized to view this appointment' });
      }
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Error fetching appointment' });
  }
};

/**
 * Create a new appointment
 */
const createAppointment = async (req, res) => {
  try {
    const { barber_id, service_id, appointment_time } = req.body;
    
    // Check if the slot is available
    const existingAppointment = await Appointment.findOne({
      where: {
        barber_id,
        appointment_time,
        status: { [Op.ne]: 'canceled' }
      }
    });
    
    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }
    
    // Check if the service exists
    const service = await Service.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if the barber exists
    const barber = await Barber.findByPk(barber_id);
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }
    
    // Check if the barber is available on this day/time
    const appointmentDate = new Date(appointment_time);
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    const barberAvailability = await BarberAvailability.findOne({
      where: {
        barber_id,
        day_of_week: dayOfWeek
      }
    });
    
    if (!barberAvailability) {
      return res.status(400).json({ message: 'Barber is not available on this day' });
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
      return res.status(400).json({ message: 'Appointment time is outside barber working hours' });
    }
    
    // Create appointment
    const appointment = await Appointment.create({
      customer_id: req.user.id,
      barber_id,
      service_id,
      appointment_time,
      status: 'scheduled'
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
    
    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: createdAppointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Error creating appointment' });
  }
};

/**
 * Update appointment
 */
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_time, service_id } = req.body;
    
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Customers can only update their own appointments
    if (req.user.Role.name === 'customer' && appointment.customer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }
    
    // Barbers can only update appointments they're assigned to
    if (req.user.Role.name === 'barber') {
      const barber = await Barber.findOne({ where: { user_id: req.user.id } });
      if (!barber || appointment.barber_id !== barber.id) {
        return res.status(403).json({ message: 'Not authorized to update this appointment' });
      }
    }
    
    // Only allow updates if appointment is still scheduled
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ 
        message: 'Cannot update appointment that is already completed or canceled' 
      });
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
        return res.status(400).json({ message: 'This time slot is already booked' });
      }
    }
    
    // Update appointment
    await appointment.update({
      appointment_time: appointment_time || appointment.appointment_time,
      service_id: service_id || appointment.service_id
    });
    
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
    
    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Error updating appointment' });
  }
};

/**
 * Update appointment status
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['scheduled', 'completed', 'canceled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Only barbers and owners can change status
    if (req.user.Role.name === 'barber') {
      const barber = await Barber.findOne({ where: { user_id: req.user.id } });
      if (!barber || appointment.barber_id !== barber.id) {
        return res.status(403).json({ message: 'Not authorized to update this appointment' });
      }
    }
    
    // Update status
    await appointment.update({ status });
    
    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Error updating appointment status' });
  }
};

/**
 * Cancel appointment
 */
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Customers can only cancel their own appointments
    if (req.user.Role.name === 'customer' && appointment.customer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }
    
    // Only allow cancellation if appointment is still scheduled
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ 
        message: 'Cannot cancel appointment that is already completed or canceled' 
      });
    }
    
    // Update status to canceled
    await appointment.update({ status: 'canceled' });
    
    res.json({
      message: 'Appointment canceled successfully'
    });
  } catch (error) {
    console.error('Error canceling appointment:', error);
    res.status(500).json({ message: 'Error canceling appointment' });
  }
};

/**
 * Get available appointment slots
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { barber_id, date, service_id } = req.query;
    
    if (!barber_id || !date) {
      return res.status(400).json({ message: 'Barber ID and date are required' });
    }
    
    // Get the day of week from the date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check barber availability for this day
    const availability = await BarberAvailability.findOne({
      where: {
        barber_id,
        day_of_week: dayOfWeek
      }
    });
    
    if (!availability) {
      return res.json({ 
        message: 'Barber is not available on this day',
        available_slots: []
      });
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
    
    res.json({
      barber_id,
      date,
      service_id,
      available_slots: slots
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ message: 'Error getting available slots' });
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