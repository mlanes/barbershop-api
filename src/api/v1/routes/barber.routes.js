const express = require('express');
const { isAuthenticated, isOwner, isBarber, isOwnerOrBarber } = require('../middlewares/auth.middleware');
const { checkBranchAccess } = require('../middlewares/branch.middleware');
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
 *         branch_id:
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
 *         Branch:
 *           $ref: '#/components/schemas/Branch'
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
 *       type: array
 *       items:
 *         type: object
 *         required:
 *           - day_of_week
 *           - start_time
 *           - end_time
 *         properties:
 *           day_of_week:
 *             type: integer
 *             minimum: 0
 *             maximum: 6
 *           start_time:
 *             type: string
 *             format: time
 *           end_time:
 *             type: string
 *             format: time
 *       minItems: 7
 *       maxItems: 7
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
 * /branches/{branchId}/barbers:
 *   get:
 *     summary: Get all barbers for a branch
 *     tags: [Barbers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: List of branch barbers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Barber'
 *       401:
 *         description: Not authenticated
 */
router.get('/branches/:branchId/barbers', isAuthenticated, checkBranchAccess, barberController.getBarbersByBranch);

/**
 * @swagger
 * /branches/{branchId}/barbers:
 *   post:
 *     summary: Add a barber to a branch
 *     tags: [Barbers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
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
 *               availabilities:
 *                 $ref: '#/components/schemas/BarberAvailabilityInput'
 *     responses:
 *       201:
 *         description: Barber added to branch successfully
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
 */
router.post('/branches/:branchId/barbers', isOwner, checkBranchAccess, barberController.addBarberToBranch);

/**
 * @swagger
 * /barbers:
 *   get:
 *     summary: Get all barbers
 *     tags: [Barbers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all barbers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Barber'
 *       401:
 *         description: Not authenticated
 */
router.get('/', isAuthenticated, barberController.getAllBarbers);

/**
 * @swagger
 * /barbers/{id}:
 *   get:
 *     summary: Get barber details by ID
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
 *     responses:
 *       200:
 *         description: Barber details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Barber'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Barber not found
 */
router.get('/:id', isAuthenticated, barberController.getBarberById);

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
router.put('/:id/status', isOwner, checkBranchAccess, barberController.updateBarberStatus);

/**
 * @swagger
 * /barbers/{id}/availability:
 *   get:
 *     summary: Get barber availability
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
 *     responses:
 *       200:
 *         description: Barber availability schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BarberAvailability'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Barber not found
 */
router.get('/:id/availability', isAuthenticated, barberController.getBarberAvailabilityById);

/**
 * @swagger
 * /barbers/{id}/availability:
 *   post:
 *     summary: Set barber availability
 *     description: Set working hours for each day of the week
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BarberAvailability'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner or the barber to set availability
 *       404:
 *         description: Barber not found
 */
router.post('/:id/availability', isOwnerOrBarber, checkBranchAccess, barberController.setBarberAvailabilityById);

/**
 * @swagger
 * /barbers/{id}/services:
 *   get:
 *     summary: Get services offered by a barber
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
 *     responses:
 *       200:
 *         description: List of services offered by the barber
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Barber not found
 */
router.get('/:id/services', isAuthenticated, barberController.getBarberServices);

module.exports = router;