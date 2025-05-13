/**
 * Custom API Error class for handling operational errors
 * @extends Error
 */
class ApiError extends Error {
  /**
   * Creates an instance of ApiError
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Creates a 400 Bad Request error
   * @param {string} message - Error message
   * @returns {ApiError} Bad request error instance
   */
  static badRequest(message) {
    return new ApiError(400, message);
  }

  /**
   * Creates a 404 Not Found error
   * @param {string} message - Error message
   * @returns {ApiError} Not found error instance
   */
  static notFound(message) {
    return new ApiError(404, message);
  }

  /**
   * Creates a 401 Unauthorized error
   * @param {string} message - Error message
   * @returns {ApiError} Unauthorized error instance
   */
  static unauthorized(message) {
    return new ApiError(401, message);
  }

  /**
   * Creates a 403 Forbidden error
   * @param {string} message - Error message
   * @returns {ApiError} Forbidden error instance
   */
  static forbidden(message) {
    return new ApiError(403, message);
  }

  /**
   * Creates a 500 Internal Server error
   * @param {string} [message='Internal server error'] - Error message
   * @returns {ApiError} Internal server error instance
   */
  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;