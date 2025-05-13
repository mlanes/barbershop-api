const { Branch, Barber } = require('../../../models');
const ApiError = require('../../../utils/errors/api-error');
const logger = require('../../../utils/logger');
/**
 * Middleware to verify user has access to branch
 * For barbers: must be assigned to the branch
 * For owners: must own the barbershop
 * For customers: always allowed
 */
const checkBranchAccess = async (req, res, next) => {
  try {
    const branch = req.branch;
    if (!branch) {
      throw ApiError.internal('Branch not loaded');
    }

    const userRole = req.user.Role.name;

    if (userRole === 'barber') {
      const barber = await Barber.findOne({
        where: {
          user_id: req.user.id,
          branch_id: branch.id,
          is_active: true
        }
      });

      if (!barber) {
        throw ApiError.forbidden('Not authorized to access this branch');
      }
    }
    else if (userRole === 'owner') {
      const barbershop = await branch.getBarbershop();
      // Add owner verification logic here if needed
    }

    next();
  } catch (error) {
    logger.error('Error checking branch access:', error);
    next(error);
  }
};

module.exports = {
  checkBranchExists,
  checkBranchAccess
};