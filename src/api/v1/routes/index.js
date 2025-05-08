const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const barbershopRoutes = require('./barbershop.routes');
const appointmentRoutes = require('./appointment.routes');
const barberRoutes = require('./barber.routes');
const serviceRoutes = require('./service.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/barbershops', barbershopRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/barbers', barberRoutes);
router.use('/services', serviceRoutes);

module.exports = router;
