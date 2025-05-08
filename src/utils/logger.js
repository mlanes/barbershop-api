const logger = {
    info: (message, meta = {}) => {
        console.log(JSON.stringify({ level: 'info', message, ...meta }));
    },
    error: (message, meta = {}) => {
        console.error(JSON.stringify({ level: 'error', message, ...meta }));
    },
    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({ level: 'warn', message, ...meta }));
    },
    debug: (message, meta = {}) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(JSON.stringify({ level: 'debug', message, ...meta }));
        }
    }
};

module.exports = logger;