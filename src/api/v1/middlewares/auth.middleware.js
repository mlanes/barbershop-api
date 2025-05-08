const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const { User, Role } = require('../../../models');
const ApiError = require('../../../utils/errors/api-error');
const logger = require('../../../utils/logger');
const env = require('../../../config/env');

const issuer = `https://cognito-idp.${env.COGNITO_REGION}.amazonaws.com/${env.COGNITO_USER_POOL_ID}`;

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true, 
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${issuer}/.well-known/jwks.json`
  }),
  audience: env.COGNITO_APP_CLIENT_ID,
  issuer,
  algorithms: ['RS256']
});

const loadUser = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.sub) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const user = await User.findOne({
      where: { cognito_sub: req.auth.sub },
      include: [{ model: Role }]
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Error loading user:', error);
    next(ApiError.internal('Error loading user'));
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const userRole = req.user.Role.name;
    
    if (!allowedRoles.includes(userRole)) {
      throw ApiError.forbidden('Access denied: Insufficient permissions');
    }

    next();
  };
};

module.exports = {
  checkJwt,
  loadUser,
  requireRole,
  isAuthenticated: [checkJwt, loadUser],
  isOwner: [checkJwt, loadUser, requireRole('owner')],
  isBarber: [checkJwt, loadUser, requireRole('barber')],
  isCustomer: [checkJwt, loadUser, requireRole('customer')],
  isOwnerOrBarber: [checkJwt, loadUser, requireRole('owner', 'barber')]
};