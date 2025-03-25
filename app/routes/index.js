const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const barbershopRoutes = require('./barbershopRoutes');
const appointmentRoutes = require('./appointmentRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/barbershops', barbershopRoutes);
router.use('/appointments', appointmentRoutes);

module.exports = router;
