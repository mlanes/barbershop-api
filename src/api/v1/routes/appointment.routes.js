const express = require('express');
const { isAuthenticated, isOwner, isBarber, isCustomer } = require('../middlewares/auth.middleware');
const { checkBranchAccess } = require('../middlewares/branch.middleware');
const appointmentController = require('../controllers/appointment.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management endpoints
 *
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         customer_id:
 *           type: integer
 *         branch_id:
 *           type: integer
 *         barber_id:
 *           type: integer
 *         service_id:
 *           type: integer
 *         appointment_time:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [scheduled, completed, canceled]
 *         Customer:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             full_name:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *         Branch:
 *           $ref: '#/components/schemas/Branch'
 *         Barber:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             User:
 *               type: object
 *               properties:
 *                 full_name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *         Service:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             duration:
 *               type: integer
 *             price:
 *               type: number
 *
 *     AppointmentInput:
 *       type: object
 *       required:
 *         - branch_id
 *         - barber_id
 *         - service_id
 *         - appointment_time
 *       properties:
 *         branch_id:
 *           type: integer
 *           description: Branch ID
 *         barber_id:
 *           type: integer
 *           description: Barber ID
 *         service_id:
 *           type: integer
 *           description: Service ID
 *         appointment_time:
 *           type: string
 *           format: date-time
 *           description: Appointment date and time
 *
 *     StatusUpdateInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [scheduled, completed, canceled]
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments (filtered by user role)
 *     description: Owner can see all appointments, barbers see their own, customers see their own
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Not authenticated
 */
router.get('/', isAuthenticated, appointmentController.getAppointments);

/**
 * @swagger
 * /appointments/available-slots:
 *   get:
 *     summary: Get available appointment slots
 *     description: Get available slots for a specific barber at a branch
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the branch
 *       - in: query
 *         name: barber_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the barber
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability (YYYY-MM-DD)
 *       - in: query
 *         name: service_id
 *         schema:
 *           type: integer
 *         description: Optional service ID to consider duration
 *     responses:
 *       200:
 *         description: List of available time slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 branch_id:
 *                   type: integer
 *                   description: Branch ID
 *                 barber_id:
 *                   type: integer
 *                   description: Barber ID
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: Date checked
 *                 service_id:
 *                   type: integer
 *                   description: Optional service ID
 *                 available_slots:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Invalid input parameters
 *       404:
 *         description: Branch, barber or service not found
 */
router.get('/available-slots', appointmentController.getAvailableSlots);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view this appointment
 *       404:
 *         description: Appointment not found
 */
router.get('/:id', isAuthenticated, appointmentController.getAppointmentById);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentInput'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid input data or time slot already booked
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be a customer to book appointments
 *       404:
 *         description: Branch, barber or service not found
 */
router.post('/', isCustomer, checkBranchAccess, appointmentController.createAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Update an appointment
 *     description: Customers can only update their appointments if status is 'scheduled'
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentInput'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid input data or appointment cannot be updated
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this appointment
 *       404:
 *         description: Appointment or related resources not found
 */
router.put('/:id', isAuthenticated, checkBranchAccess, appointmentController.updateAppointment);

/**
 * @swagger
 * /appointments/{id}/status:
 *   put:
 *     summary: Update appointment status
 *     description: Only barbers and owners can update appointment status
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusUpdateInput'
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be a barber or owner to update status
 *       404:
 *         description: Appointment not found
 */
router.put('/:id/status', isBarber, checkBranchAccess, appointmentController.updateAppointmentStatus);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Cancel an appointment
 *     description: Customers can only cancel their own appointments if status is 'scheduled'
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment canceled successfully
 *       400:
 *         description: Appointment cannot be canceled
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to cancel this appointment
 *       404:
 *         description: Appointment not found
 */
router.delete('/:id', isAuthenticated, checkBranchAccess, appointmentController.cancelAppointment);

module.exports = router;