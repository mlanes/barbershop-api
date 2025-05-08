const express = require('express');
const { isAuthenticated, isOwner, isBarber } = require('../middlewares/auth.middleware');
const barberController = require('../controllers/barber.controller');

const router = express.Router();

/**
 * @route GET /api/barbers
 * @desc Get all barbers
 * @access Public
 */
router.get('/', barberController.getAllBarbers);

/**
 * @route GET /api/barbers/:id
 * @desc Get barber details
 * @access Public
 */
router.get('/:id', barberController.getBarberById);

/**
 * @route PUT /api/barbers/:id
 * @desc Update barber status (active/inactive)
 * @access Private/Owner
 */
router.put('/:id/status', isOwner, barberController.updateBarberStatus);

/**
 * @route GET /api/barbers/:id/availability
 * @desc Get barber availability
 * @access Public
 */
router.get('/:id/availability', barberController.getBarberAvailabilityById);

/**
 * @route POST /api/barbers/:id/availability
 * @desc Set barber availability
 * @access Private/Owner or Barber
 */
router.post('/:id/availability', isBarber, barberController.setBarberAvailabilityById);

/**
 * @route GET /api/barbers/:id/services
 * @desc Get services offered by a barber
 * @access Public
 */
router.get('/:id/services', barberController.getBarberServices);

module.exports = router;