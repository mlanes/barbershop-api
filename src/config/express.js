const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('../api/v1/routes');
const db = require('../models');
const errorHandler = require('../utils/middlewares/error.middleware');
const ApiError = require('../utils/errors/api-error');
const logger = require('../utils/logger');

const createApp = () => {
    const app = express();

    // Basic middleware
    app.use(cors());
    app.use(express.json());
    app.use(morgan('dev'));

    // Routes
    app.use('/api/v1', routes);

    // Health Check Route
    app.get('/', (req, res) => {
        res.json({ message: 'Barbershop API is running' });
    });

    // Handle 404
    app.use((req, res, next) => {
        next(ApiError.notFound('Endpoint not found'));
    });

    // Error handling
    app.use(errorHandler);

    return app;
};

const startServer = async (port) => {
    try {
        // Test database connection
        await db.sequelize.authenticate();
        logger.info('Database connection established successfully');

        const app = createApp();
        
        app.listen(port, () => {
            logger.info(`Server is running on port ${port}`);
        });

        return app;
    } catch (error) {
        logger.error('Unable to start server:', error);
        process.exit(1);
    }
};

module.exports = { createApp, startServer, sequelize: db.sequelize };