const express = require('express');
const { isAuthenticated, isOwner } = require('../middlewares/auth.middleware');
const { checkBranchAccess } = require('../middlewares/branch.middleware');
const serviceController = require('../controllers/service.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Service management endpoints
 *
 * components:
 *   schemas:
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
 *         branch_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         Branch:
 *           $ref: '#/components/schemas/Branch'
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
 *           description: Duration in minutes
 *         price:
 *           type: number
 *           format: float
 *
 *     ServiceAssignment:
 *       type: object
 *       required:
 *         - barber_id
 *       properties:
 *         barber_id:
 *           type: integer
 *           description: ID of the barber to assign the service to
 */

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services across all branches
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of all services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 */
router.get('/', serviceController.getAllServices);

/**
 * @swagger
 * /branches/{branchId}/services:
 *   get:
 *     summary: Get all services for a branch
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: List of branch services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       404:
 *         description: Branch not found
 */
router.get('/branches/:branchId/services', checkBranchAccess, serviceController.getServicesByBranch);

/**
 * @swagger
 * /branches/{branchId}/services:
 *   post:
 *     summary: Add a service to a branch
 *     tags: [Services]
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
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       201:
 *         description: Service added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner to add services
 *       404:
 *         description: Branch not found
 */
router.post('/branches/:branchId/services', isOwner, checkBranchAccess, serviceController.addServiceToBranch);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get service details by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 */
router.get('/:id', serviceController.getServiceById);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update a service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner to update services
 *       404:
 *         description: Service not found
 */
router.put('/:id', isOwner, checkBranchAccess, serviceController.updateServiceById);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner to delete services
 *       404:
 *         description: Service not found
 */
router.delete('/:id', isOwner, checkBranchAccess, serviceController.deleteServiceById);

/**
 * @swagger
 * /services/{id}/barbers:
 *   post:
 *     summary: Assign service to a barber
 *     description: Barber must belong to the same branch as the service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceAssignment'
 *     responses:
 *       200:
 *         description: Service assigned to barber successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service_id:
 *                   type: integer
 *                 barber_id:
 *                   type: integer
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Must be an owner to assign services
 *       404:
 *         description: Service, barber not found, or barber not in same branch
 */
router.post('/:id/barbers', isOwner, checkBranchAccess, serviceController.assignServiceToBarberById);

/**
 * @swagger
 * /services/{id}/barbers:
 *   get:
 *     summary: Get barbers who offer this service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     responses:
 *       200:
 *         description: List of barbers offering this service
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Barber'
 *       404:
 *         description: Service not found
 */
router.get('/:id/barbers', serviceController.getBarbersByService);

module.exports = router;