const express = require('express');
const { isAuthenticated, isOwner } = require('../../middleware/v1/auth.middleware');
const serviceController = require('../../controllers/v1/service.controller');

const router = express.Router();

/**
 * @route GET /api/services
 * @desc Get all services
 * @access Public
 */
router.get('/', serviceController.getAllServices);

/**
 * @route GET /api/services/:id
 * @desc Get service details
 * @access Public
 */
router.get('/:id', serviceController.getServiceById);

/**
 * @route POST /api/services
 * @desc Create a new service
 * @access Private/Owner
 */
router.post('/', isOwner, serviceController.createService);

/**
 * @route PUT /api/services/:id
 * @desc Update service
 * @access Private/Owner
 */
router.put('/:id', isOwner, serviceController.updateServiceById);

/**
 * @route DELETE /api/services/:id
 * @desc Delete service
 * @access Private/Owner
 */
router.delete('/:id', isOwner, serviceController.deleteServiceById);

/**
 * @route POST /api/services/:id/assign
 * @desc Assign service to barber
 * @access Private/Owner
 */
router.post('/:id/assign', isOwner, serviceController.assignServiceToBarberById);

/**
 * @route GET /api/services/:id/barbers
 * @desc Get barbers who offer this service
 * @access Public
 */
router.get('/:id/barbers', serviceController.getBarbersByService);

module.exports = router;