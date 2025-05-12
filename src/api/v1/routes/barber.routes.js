const express = require('express');
const { isAuthenticated, isOwner, isBarber } = require('../middlewares/auth.middleware');
const barberController = require('../controllers/barber.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Barbers
 *   description: Barber management endpoints
 *
 * components:
 *   schemas:
 *     Barber:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         barbershop_id:
 *           type: integer
 *         is_active:
 *           type: boolean
 *         User:
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
 *         Barbershop:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *
 *     BarberAvailability:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         barber_id:
 *           type: integer
 *         day_of_week:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *         start_time:
 *           type: string
 *           format: time
 *         end_time:
 *           type: string
 *           format: time
 *
 *     BarberAvailabilityInput:
 *       type: object
 *       required:
 *         - day_of_week
 *         - start_time
 *         - end_time
 *       properties:
 *         day_of_week:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *         start_time:
 *           type: string
 *           format: time
 *         end_time:
 *           type: string
 *           format: time
 *
 *     BarberStatusUpdate:
 *       type: object
 *       required:
 *         - is_active
 *       properties:
 *         is_active:
 *           type: boolean
 */

/**
 * @swagger
 * /barbers:
 *   get:
 *     summary: Get all barbers
 *     tags: [Barbers]
 *     responses:
 *       200:
 *         description: List of all barbers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Barber'
 */
router.get('/', barberController.getAllBarbers);

/**
 * @swagger
 * /barbers/{id}:
 *   get:
 *     summary: Get barber details by ID
 *     tags: [Barbers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Barber ID
 *     responses:
 *       200:
 *         description: Barber details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Barber'
 *       404:
 *         description: Barber not found
 */
router.get('/:id', barberController.getBarberById);

/**
 * @swagger
 * /barbers/{id}/status:
 *   put:
 *     summary: Update barber status
 *     description: Set barber as active or inactive
 *     tags: [Barbers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Barber ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BarberStatusUpdate'
 *     responses:
 *       200:
 *         description: Barber status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Barber'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner to update barber status
 *       404:
 *         description: Barber not found
 */
router.put('/:id/status', isOwner, barberController.updateBarberStatus);

/**
 * @swagger
 * /barbers/{id}/availability:
 *   get:
 *     summary: Get barber availability
 *     tags: [Barbers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Barber ID
 *     responses:
 *       200:
 *         description: Barber availability schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BarberAvailability'
 *       404:
 *         description: Barber not found
 */
router.get('/:id/availability', barberController.getBarberAvailabilityById);

/**
 * @swagger
 * /barbers/{id}/availability:
 *   post:
 *     summary: Set barber availability
 *     description: Set working hours for a specific day of the week
 *     tags: [Barbers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Barber ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BarberAvailabilityInput'
 *     responses:
 *       200:
 *         description: Availability set successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BarberAvailability'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner or the barber to set availability
 *       404:
 *         description: Barber not found
 */
router.post('/:id/availability', isBarber, barberController.setBarberAvailabilityById);

/**
 * @swagger
 * /barbers/{id}/services:
 *   get:
 *     summary: Get services offered by a barber
 *     tags: [Barbers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Barber ID
 *     responses:
 *       200:
 *         description: List of services offered by the barber
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       404:
 *         description: Barber not found
 */
router.get('/:id/services', barberController.getBarberServices);

module.exports = router;