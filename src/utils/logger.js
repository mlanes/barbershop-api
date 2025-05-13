/**
 * Custom logger implementation with different log levels
 * @namespace
 */

const env = require('../config/env');

const logger = {
    /**
     * Log info level message
     * @param {string} message - Log message
     * @param {Object} [meta={}] - Additional metadata to log
     */
    info: (message, meta = {}) => {
        console.log(JSON.stringify({ level: 'info', message, ...meta }));
    },
    /**
     * Log error level message
     * @param {string} message - Log message
     * @param {Object} [meta={}] - Additional metadata to log
     */
    error: (message, meta = {}) => {
        console.error(JSON.stringify({ level: 'error', message, ...meta }));
    },
    /**
     * Log warning level message
     * @param {string} message - Log message
     * @param {Object} [meta={}] - Additional metadata to log
     */
    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({ level: 'warn', message, ...meta }));
    },
    /**
     * Log debug level message (only in non-production)
     * @param {string} message - Log message
     * @param {Object} [meta={}] - Additional metadata to log
     */
    debug: (message, meta = {}) => {
        if (env.NODE_ENV !== 'production') {
            console.debug(JSON.stringify({ level: 'debug', message, ...meta }));
        }
    }
};

module.exports = logger;