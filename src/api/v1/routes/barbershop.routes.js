const express = require('express');
const { isAuthenticated, isOwner, isBarber } = require('../middlewares/auth.middleware');
const barbershopController = require('../controllers/barbershop.controller');
const barberController = require('../controllers/barber.controller');
const serviceController = require('../controllers/service.controller');

const router = express.Router();

/**
 * @route GET /api/barbershops
 * @desc Get all barbershops
 * @access Public
 */
router.get('/', barbershopController.getAllBarbershops);

/**
 * @route GET /api/barbershops/:id
 * @desc Get barbershop details
 * @access Public
 */
router.get('/:id', barbershopController.getBarbershopById);

/**
 * @route POST /api/barbershops
 * @desc Create a new barbershop
 * @access Private/Owner
 */
router.post('/', isOwner, barbershopController.createBarbershop);

/**
 * @route PUT /api/barbershops/:id
 * @desc Update barbershop
 * @access Private/Owner
 */
router.put('/:id', isOwner, barbershopController.updateBarbershop);

/**
 * @route DELETE /api/barbershops/:id
 * @desc Delete barbershop
 * @access Private/Owner
 */
router.delete('/:id', isOwner, barbershopController.deleteBarbershop);

// Barber routes
/**
 * @route GET /api/barbershops/:barbershopId/barbers
 * @desc Get all barbers for a barbershop
 * @access Public
 */
router.get('/:barbershopId/barbers', barberController.getBarbersByBarbershop);

/**
 * @route POST /api/barbershops/:barbershopId/barbers
 * @desc Add a barber to a barbershop
 * @access Private/Owner
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