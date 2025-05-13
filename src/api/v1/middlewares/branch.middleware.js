const { Branch, Barber, Barbershop } = require('../../../models');
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
    const branchId = req.params.branchId || req.params.id || req.body.branch_id;
    if (!branchId) {
      throw ApiError.badRequest('Branch ID is required');
    }

    const branch = await Branch.findOne({
      where: { id: branchId },
      include: [{
        model: Barbershop,
        attributes: ['id']
      }]
    });

    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }

    const userRole = req.user.Role.name;

    if (userRole === 'barber') {
      const barber = await Barber.findOne({
        where: {
          user_id: req.user.id,
          branch_id: branchId,
          is_active: true
        }
      });

      if (!barber) {
        throw ApiError.forbidden('Not authorized to access this branch');
      }
    }
    else if (userRole === 'owner') {
      const barber = await Barber.findOne({
        where: {
          user_id: req.user.id,
          is_active: true
        },
        include: [{
          model: Branch,
          where: {
            barbershop_id: branch.Barbershop.id
          }
        }]
      });
      
      if (!barber) {
        throw ApiError.forbidden('Not authorized to access this branch');
      }
    }

    req.branch = branch;
    next();
  } catch (error) {
    logger.error('Error checking branch access:', error);
    next(error);
  }
};

module.exports = {
  checkBranchAccess
};