/**
 * Returns the response time in ms since startTime, or null if not set.
 */
const getElapsedTime = (hrStart) => {
  if (!hrStart) return null;
  const diff = process.hrtime(hrStart);
  return {
    elapsedTime:  Number((diff[0] * 1e3 + diff[1] / 1e6).toFixed(3)),
    elapsedTimeUnit: 'ms'
  }
};

module.exports = {
  getElapsedTime
}