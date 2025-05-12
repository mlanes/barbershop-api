const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const routes = require('../api/v1/routes');
const db = require('../models');
const errorHandler = require('../api/v1/middlewares/error.middleware');
const ApiError = require('../utils/errors/api-error');
const logger = require('../utils/logger');

const createApp = () => {
    const app = express();

    // Basic middleware
    app.use(cors());
    app.use(express.json());
    app.use(morgan('dev'));

    // API Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // API Routes
    app.use('/api/v1', routes);

    // Handle 404
    app.use((req, res, next) => {
        next(ApiError.notFound('Endpoint not found'));
    });

    // Error handling
    app.use(errorHandler);

    return app;
};

module.exports = { createApp, sequelize: db.sequelize };