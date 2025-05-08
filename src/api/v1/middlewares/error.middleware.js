const ApiError = require('../../../utils/errors/api-error');
const logger = require('../../../utils/logger');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    logger.error(err.message, { 
      status: err.status,
      path: req.path,
      method: req.method,
      stack: err.stack
    });

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Handle JWT errors
  if (err.name === 'UnauthorizedError') {
    logger.error('JWT Error', { 
      error: err.message,
      path: req.path,
      method: req.method
    });

    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token'
    });
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    logger.error('Validation Error', {
      errors: err.errors,
      path: req.path,
      method: req.method
    });

    return res.status(400).json({
      status: 'fail',
      message: err.errors.map(e => e.message).join(', ')
    });
  }

  // Handle unknown errors
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

module.exports = errorHandler;