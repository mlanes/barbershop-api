const express = require('express');
const authRoutes = require('./v1/auth.routes');
const userRoutes = require('./v1/user.routes');
const barbershopRoutes = require('./v1/barbershop.routes');
const appointmentRoutes = require('./v1/appointment.routes');
const barberRoutes = require('./v1/barber.routes');
const serviceRoutes = require('./v1/service.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/barbershops', barbershopRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/barbers', barberRoutes);
router.use('/services', serviceRoutes);

module.exports = router;
