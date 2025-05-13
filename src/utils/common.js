/**
 * Calculates the elapsed time since the provided high-resolution time
 * @param {[number, number]} hrStart - The high-resolution time tuple [seconds, nanoseconds]
 * @returns {{ elapsedTime: number, elapsedTimeUnit: string } | null} Object containing elapsed time and unit, or null if no start time
 */
const getElapsedTime = (hrStart) => {
  if (!hrStart) return null;
  const [seconds, nanoseconds] = process.hrtime(hrStart);
  return {
    elapsedTime:  Number((seconds * 1e3 + nanoseconds / 1e6).toFixed(3)),
    elapsedTimeUnit: 'ms'
  }
};

module.exports = {
  getElapsedTime
}