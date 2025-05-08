require('dotenv').config();

const env = {
    // App
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,

    // Database
    DB_URL: process.env.DB_URL,
    DB_DIALECT: process.env.DB_DIALECT,

    // AWS Cognito
    COGNITO_REGION: process.env.COGNITO_REGION,
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
    COGNITO_APP_CLIENT_ID: process.env.COGNITO_APP_CLIENT_ID,
};

// Validate required environment variables
const requiredEnvVars = [
    'DB_URL', 
    'DB_DIALECT',
    'COGNITO_REGION',
    'COGNITO_USER_POOL_ID',
    'COGNITO_APP_CLIENT_ID'
];

const missingEnvVars = requiredEnvVars.filter(key => !env[key]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = env;