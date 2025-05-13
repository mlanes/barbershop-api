const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const routes = require('../api/v1/routes');
const db = require('../models');
const errorHandler = require('../api/v1/middlewares/error.middleware');
const requestTimer = require('../api/v1/middlewares/requestTimer.middleware');
const ApiError = require('../utils/errors/api-error');
const env = require('./env');

const createApp = () => {
    const app = express();

    // Basic middleware
    app.use(cors());
    app.use(express.json());
    app.use(morgan('dev'));

    // API Documentation (development only)
    if (env.NODE_ENV !== 'production') {
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }

    // Handle request processing time
    app.use(requestTimer);

    // API Routes
    app.use('/api/v1', routes);

    // Handle 404
    app.use((req, res, next) => {
      next(ApiError.notFound('Endpoint not found', req.startTime));
    });

    // Error handling
    app.use(errorHandler);

    return app;
};

module.exports = { createApp, sequelize: db.sequelize };