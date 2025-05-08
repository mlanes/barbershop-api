const { createApp, sequelize } = require('./config/express');
const env = require('./config/env');
const logger = require('./utils/logger');

const app = createApp();

const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        logger.info('Database connection established successfully');

        // Sync database models (only in development)
        if (env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: true });
            logger.info('Database tables synchronized');
        }
        
        app.listen(env.PORT, () => {
            logger.info(`Server is running on port ${env.PORT}`);
        });
    } catch (error) {
        logger.error('Unable to start server:', error);
        process.exit(1);
    }
};

startServer();