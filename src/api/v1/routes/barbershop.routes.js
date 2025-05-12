const express = require('express');
const { isAuthenticated, isOwner, isBarber } = require('../middlewares/auth.middleware');
const barbershopController = require('../controllers/barbershop.controller');
const barberController = require('../controllers/barber.controller');
const serviceController = require('../controllers/service.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Barbershops
 *   description: Barbershop management endpoints
 *
 * components:
 *   schemas:
 *     Barbershop:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     BarbershopInput:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - email
 *       properties:
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         duration:
 *           type: integer
 *           description: Service duration in minutes
 *         price:
 *           type: number
 *           format: float
 *         barbershop_id:
 *           type: integer
 *
 *     ServiceInput:
 *       type: object
 *       required:
 *         - name
 *         - duration
 *         - price
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         duration:
 *           type: integer
 *         price:
 *           type: number
 *
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
 *             full_name:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *
 *     BarberAvailability:
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
 */

/**
 * @swagger
 * /barbershops:
 *   get:
 *     summary: Get all barbershops
 *     tags: [Barbershops]
 *     responses:
 *       200:
 *         description: List of barbershops
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Barbershop'
 */
router.get('/', barbershopController.getAllBarbershops);

/**
 * @swagger
 * /barbershops/{id}:
 *   get:
 *     summary: Get barbershop details by ID
 *     tags: [Barbershops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Barbershop ID
 *     responses:
 *       200:
 *         description: Barbershop details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Barbershop'
 *       404:
 *         description: Barbershop not found
 */
router.get('/:id', barbershopController.getBarbershopById);

/**
 * @swagger
 * /barbershops:
 *   post:
 *     summary: Create a new barbershop
 *     tags: [Barbershops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BarbershopInput'
 *     responses:
 *       201:
 *         description: Barbershop created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Barbershop'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner to create barbershop
 */
router.post('/', isOwner, barbershopController.createBarbershop);

/**
 * @swagger
 * /barbershops/{id}:
 *   put:
 *     summary: Update a barbershop
 *     tags: [Barbershops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Barbershop ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BarbershopInput'
 *     responses:
 *       200:
 *         description: Barbershop updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Barbershop'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner to update barbershop
 *       404:
 *         description: Barbershop not found
 */
router.put('/:id', isOwner, barbershopController.updateBarbershop);

/**
 * @swagger
 * /barbershops/{id}:
 *   delete:
 *     summary: Delete a barbershop
 *     tags: [Barbershops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Barbershop ID
 *     responses:
 *       200:
 *         description: Barbershop deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner to delete barbershop
 *       404:
 *         description: Barbershop not found
 */
router.delete('/:id', isOwner, barbershopController.deleteBarbershop);

// Barber routes
/**
 * @swagger
 * /barbershops/{barbershopId}/barbers:
 *   get:
 *     summary: Get all barbers for a barbershop
 *     tags: [Barbershops]
 *     parameters:
 *       - in: path
 *         name: barbershopId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Barbershop ID
 *     responses:
 *       200:
 *         description: List of barbers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Barber'
 *       404:
 *         description: Barbershop not found
 */
router.get('/:barbershopId/barbers', barberController.getBarbersByBarbershop);

/**
 * @swagger
 * /barbershops/{barbershopId}/barbers:
 *   post:
 *     summary: Add a barber to a barbershop
 *     tags: [Barbershops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barbershopId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Barbershop ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user to be added as a barber
 *     responses:
 *       201:
 *         description: Barber added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Barber'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner to add barbers
 *       404:
 *         description: Barbershop or user not found
 */
router.post('/:barbershopId/barbers', isOwner, barberController.addBarber);

// Service routes
/**
 * @route GET /api/barbershops/:barbershopId/services
 * @desc Get all services for a barbershop
 * @access Public
 */
router.get('/:barbershopId/services', serviceController.getServicesByBarbershop);

/**
 * @route POST /api/barbershops/:barbershopId/services
 * @desc Add a service to a barbershop
 * @access Private/Owner
 */
router.post('/:barbershopId/services', isOwner, serviceController.addService);

/**
 * @route PUT /api/barbershops/:barbershopId/services/:serviceId
 * @desc Update a service
 * @access Private/Owner
 */
router.put('/:barbershopId/services/:serviceId', isOwner, serviceController.updateService);

/**
 * @route DELETE /api/barbershops/:barbershopId/services/:serviceId
 * @desc Delete a service
 * @access Private/Owner
 */
router.delete('/:barbershopId/services/:serviceId', isOwner, serviceController.deleteService);

/**
 * @route POST /api/barbershops/:barbershopId/services/:serviceId/assign
 * @desc Assign service to barber
 * @access Private/Owner
 */
router.post('/:barbershopId/services/:serviceId/assign', isOwner, serviceController.assignServiceToBarber);

// Barber availability routes
/**
 * @route GET /api/barbershops/:barbershopId/barbers/:barberId/availability
 * @desc Get barber availability
 * @access Public
 */
router.get('/:barbershopId/barbers/:barberId/availability', barberController.getBarberAvailability);

/**
 * @route POST /api/barbershops/:barbershopId/barbers/:barberId/availability
 * @desc Set barber availability
 * @access Private/Owner or Barber
 */
router.post('/:barbershopId/barbers/:barberId/availability', isBarber, barberController.setBarberAvailability);

module.exports = router;