/**
 * Middleware to track request processing time
 * Adds a startTime property to the request object using process.hrtime()
 * This is used by response handlers to calculate elapsed time
 */
const requestTimer = (req, res, next) => {
  req.startTime = process.hrtime();
  next();
};

module.exports = requestTimer;