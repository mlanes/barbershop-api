const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('../api/v1/routes');
const db = require('../models');

const createApp = () => {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(morgan('dev'));

    // Routes
    app.use('/api/v1', routes);

    // Health Check Route
    app.get('/', (req, res) => {
        res.json({ message: 'Barbershop API is running' });
    });

    return app;
};

module.exports = { createApp, sequelize: db.sequelize };