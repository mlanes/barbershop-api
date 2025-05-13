const { getElapsedTime } = require('./common');

/**
 * Standard success response
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
 * Success response with pagination
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
 * Created response
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
 * No content response
 */
const noContentResponse = (res) => res.status(204).send();

module.exports = {
  successResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse
};