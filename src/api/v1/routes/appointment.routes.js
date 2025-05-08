const express = require('express');
const { isAuthenticated, isOwner, isBarber, isCustomer } = require('../../middleware/v1/auth.middleware');
const appointmentController = require('../../controllers/v1/appointment.controller');

const router = express.Router();

/**
 * @route GET /api/appointments
 * @desc Get all appointments (owner can see all, barbers see their own, customers see their own)
 * @access Private
 */
router.get('/', isAuthenticated, appointmentController.getAppointments);

/**
 * @route GET /api/appointments/available-slots
 * @desc Get available appointment slots for a specific barber and date
 * @access Public
 */
router.get('/available-slots', appointmentController.getAvailableSlots);

/**
 * @route GET /api/appointments/:id
 * @desc Get appointment by ID
 * @access Private
 */
router.get('/:id', isAuthenticated, appointmentController.getAppointmentById);

/**
 * @route POST /api/appointments
 * @desc Create a new appointment
 * @access Private/Customer
 */
router.post('/', isCustomer, appointmentController.createAppointment);

/**
 * @route PUT /api/appointments/:id
 * @desc Update appointment (customer can only update if status is 'scheduled')
 * @access Private
 */
router.put('/:id', isAuthenticated, appointmentController.updateAppointment);

/**
 * @route PUT /api/appointments/:id/status
 * @desc Update appointment status (barbers and owners only)
 * @access Private/Barber/Owner
 */
router.put('/:id/status', isBarber, appointmentController.updateAppointmentStatus);

/**
 * @route DELETE /api/appointments/:id
 * @desc Cancel appointment (customers can only cancel their own appointments)
 * @access Private
 */
router.delete('/:id', isAuthenticated, appointmentController.cancelAppointment);

module.exports = router;