const express = require('express');
const { getBranchesByBarbershop, getBranchById, createBranch, updateBranch, deleteBranch } = require('../controllers/branch.controller');
const { isAuthenticated, isOwner } = require('../middlewares/auth.middleware');
const { checkBranchAccess } = require('../middlewares/branch.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Branch management endpoints
 * 
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         barbershop_id:
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
 *         OpenDays:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               branch_id:
 *                 type: integer
 *               day_of_week:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *               opening_time:
 *                 type: string
 *                 format: time
 *               closing_time:
 *                 type: string
 *                 format: time
 *         Barbers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Barber'
 *     
 *     BranchInput:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - email
 *         - phone
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
 *         open_days:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - day_of_week
 *               - opening_time
 *               - closing_time
 *             properties:
 *               day_of_week:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *               opening_time:
 *                 type: string
 *                 format: time
 *               closing_time:
 *                 type: string
 *                 format: time
 */

/**
 * @swagger
 * /barbershops/{barbershopId}/branches:
 *   get:
 *     summary: Get all branches for a barbershop
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barbershopId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Barbershop ID
 *     responses:
 *       200:
 *         description: List of branches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Branch'
 *       401:
 *         description: Not authenticated
 */
router.get('/barbershops/:barbershopId/branches', isAuthenticated, getBranchesByBarbershop);

/**
 * @swagger
 * /branches/{id}:
 *   get:
 *     summary: Get branch by ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Branch not found
 */
router.get('/:id', isAuthenticated, getBranchById);

/**
 * @swagger
 * /barbershops/{barbershopId}/branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches]
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
 *             $ref: '#/components/schemas/BranchInput'
 *     responses:
 *       201:
 *         description: Branch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner to create branches
 */
router.post('/barbershops/:barbershopId/branches', isOwner, createBranch);

/**
 * @swagger
 * /branches/{id}:
 *   put:
 *     summary: Update branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchInput'
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner to update branches
 *       404:
 *         description: Branch not found
 */
router.put('/:id', isOwner, checkBranchAccess, updateBranch);

/**
 * @swagger
 * /branches/{id}:
 *   delete:
 *     summary: Delete branch (soft delete)
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner to delete branches
 *       404:
 *         description: Branch not found
 */
router.delete('/:id', isOwner, checkBranchAccess, deleteBranch);

module.exports = router;