const { getElapsedTime } = require('./common');

/**
 * Sends a standard success response
 * @param {import('express').Response} res - Express response object
 * @param {*} data - Response payload
 * @param {[number, number]} startTime - Request start time [seconds, nanoseconds]
 * @param {string} [message='Success'] - Optional success message
 * @param {number} [status=200] - HTTP status code
 * @returns {import('express').Response} Express response object
 */
const successResponse = (res, data, startTime, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    ...getElapsedTime(startTime),
    data
  });
};

/**
 * Sends a paginated success response
 * @param {import('express').Response} res - Express response object
 * @param {*} data - Response payload
 * @param {[number, number]} startTime - Request start time [seconds, nanoseconds]
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {import('express').Response} Express response object
 */
const paginatedResponse = (res, data, startTime, total, page, limit) => {
  return res.status(200).json({
    success: true,
    data,
    ...getElapsedTime(startTime),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
};

/**
 * Sends a created success response
 * @param {import('express').Response} res - Express response object
 * @param {*} data - Response payload
 * @param {[number, number]} startTime - Request start time [seconds, nanoseconds]
 * @param {string} [message='Created successfully'] - Optional success message
 * @returns {import('express').Response} Express response object
 */
const createdResponse = (res, data, startTime, message = 'Created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    ...getElapsedTime(startTime),
    data
  });
};

/**
 * Sends a no content response
 * @param {import('express').Response} res - Express response object
 * @returns {import('express').Response} Express response object
 */
const noContentResponse = (res) => res.status(204).send();

module.exports = {
  successResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse
};