const { Branch, BarbershopOpenDay, Barbershop, Service, Barber, User } = require('../../../models');
const { sequelize } = require('../../../models');
const ApiError = require('../../../utils/errors/api-error');
const logger = require('../../../utils/logger');
const { successResponse, createdResponse } = require('../../../utils/response');
const { validateAvailability } = require('../validators/barbershop');
const { validateBranchInput, validateBranchUpdate } = require('../validators/branch');

/**
 * Get all branches for a barbershop
 */
const getBranchesByBarbershop = async (req, res, next) => {
  try {
    const { barbershopId } = req.params;

    const branches = await Branch.findAll({
      where: { 
        barbershop_id: barbershopId,
        is_active: true 
      },
      include: [
        { model: BarbershopOpenDay },
        { 
          model: Barber,
          include: [{
            model: User,
            attributes: ['id', 'full_name', 'email', 'phone']
          }]
        }
      ]
    });

    successResponse(res, branches, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Get branch by ID
 */
const getBranchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findByPk(id, {
      include: [
        { model: BarbershopOpenDay },
        { 
          model: Barber,
          include: [{
            model: User,
            attributes: ['id', 'full_name', 'email', 'phone']
          }]
        },
        { model: Service }
      ]
    });

    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }

    successResponse(res, branch, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new branch
 */
const createBranch = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { barbershopId } = req.params;
    const { name, address, email, phone, open_days } = req.body;

    // Validate branch input
    validateBranchInput({ name, address, email, phone });

    // Verify barbershop exists
    const barbershop = await Barbershop.findOne({
      where: { 
        id: barbershopId,
        is_active: true
      },
      transaction
    });

    if (!barbershop) {
      throw ApiError.notFound('Barbershop not found');
    }

    // Validate open days if provided
    if (open_days) {
      if (!Array.isArray(open_days)) {
        throw ApiError.badRequest('open_days must be an array');
      }

      open_days.forEach(day => {
        validateAvailability({
          day_of_week: day.day_of_week,
          start_time: day.opening_time,
          end_time: day.closing_time
        });
      });
    }

    // Create branch
    const branch = await Branch.create({
      name,
      address,
      email,
      phone,
      barbershop_id: barbershopId
    }, { transaction });

    // Create open days if provided
    if (open_days && open_days.length > 0) {
      const openDaysData = open_days.map(day => ({
        branch_id: branch.id,
        day_of_week: day.day_of_week,
        opening_time: day.opening_time,
        closing_time: day.closing_time
      }));

      await BarbershopOpenDay.bulkCreate(openDaysData, { transaction });
    }

    await transaction.commit();

    logger.info('Branch created successfully', { 
      branchId: branch.id,
      barbershopId
    });

    // Get the complete branch with associations
    const createdBranch = await Branch.findByPk(branch.id, {
      include: [{ model: BarbershopOpenDay }]
    });

    createdResponse(res, createdBranch, req.startTime, 'Branch created successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Update branch
 */
const updateBranch = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, address, email, phone, open_days } = req.body;

    const branch = await Branch.findByPk(id, { transaction });
    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }

    // Validate branch update fields
    validateBranchUpdate({ email, phone });

    // Validate open days if provided
    if (open_days) {
      if (!Array.isArray(open_days)) {
        throw ApiError.badRequest('open_days must be an array');
      }

      open_days.forEach(day => {
        validateAvailability({
          day_of_week: day.day_of_week,
          start_time: day.opening_time,
          end_time: day.closing_time
        });
      });
    }

    // Update branch fields
    await branch.update({
      name: name || branch.name,
      address: address || branch.address,
      email: email || branch.email,
      phone: phone || branch.phone
    }, { transaction });

    // Update open days if provided
    if (open_days && open_days.length > 0) {
      // Remove existing open days
      await BarbershopOpenDay.destroy({ 
        where: { branch_id: id },
        transaction
      });

      // Create new open days
      const openDaysData = open_days.map(day => ({
        branch_id: branch.id,
        day_of_week: day.day_of_week,
        opening_time: day.opening_time,
        closing_time: day.closing_time
      }));

      await BarbershopOpenDay.bulkCreate(openDaysData, { transaction });
    }

    await transaction.commit();

    logger.info('Branch updated successfully', { branchId: id });

    // Get the updated branch
    const updatedBranch = await Branch.findByPk(id, {
      include: [{ model: BarbershopOpenDay }]
    });

    successResponse(res, updatedBranch, req.startTime, 'Branch updated successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Delete branch (soft delete)
 */
const deleteBranch = async (req, res, next) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findByPk(id);
    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }

    // Soft delete by setting is_active to false
    await branch.update({ is_active: false });

    logger.info('Branch deleted successfully', { branchId: id });

    successResponse(res, null, req.startTime, 'Branch deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBranchesByBarbershop,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch
};