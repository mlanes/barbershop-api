const express = require('express');
const { isAuthenticated, isOwner } = require('../middlewares/auth.middleware');
const barbershopController = require('../controllers/barbershop.controller');

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
 *           description: Main/headquarters address
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
 *         Branches:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Branch'
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
 *           description: Barbershop name
 *         address:
 *           type: string
 *           description: Main/headquarters address
 *         email:
 *           type: string
 *           format: email
 *           description: Main contact email
 *         phone:
 *           type: string
 *           description: Main contact phone
 */

/**
 * @swagger
 * /barbershops:
 *   get:
 *     summary: Get all barbershops
 *     description: Retrieves a list of all barbershops with their branches
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
 *     description: Retrieves detailed information about a barbershop including all its branches
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
 *     description: Creates a new barbershop. The first branch will be created automatically with the provided address
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
 *     description: Updates main barbershop information. Use branch endpoints to manage branch-specific details
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
 *     description: Soft deletes a barbershop and all its branches
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
 *         description: Barbershop and all branches deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner to delete barbershop
 *       404:
 *         description: Barbershop not found
 */
router.delete('/:id', isOwner, barbershopController.deleteBarbershop);

module.exports = router;