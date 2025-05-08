require('dotenv').config();
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const { User, Role } = require('../../models');

const region = process.env.COGNITO_REGION;
const poolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_APP_CLIENT_ID;
const issuer = `https://cognito-idp.${region}.amazonaws.com/${poolId}`;

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true, 
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${issuer}/.well-known/jwks.json`
  }),
  audience: clientId,
  issuer,
  algorithms: ['RS256']
});

const loadUser = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.sub) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findOne({
      where: { cognito_sub: req.auth.sub },
      include: [{ model: Role }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error loading user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userRole = req.user.Role.name;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Access denied: Insufficient permissions' 
      });
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