const { Barber, User, BarberAvailability, Branch, Role, Service } = require('../../../models');
const { sequelize } = require('../../../models');
const ApiError = require('../../../utils/errors/api-error');
const logger = require('../../../utils/logger');
const { successResponse, createdResponse } = require('../../../utils/response');
const { validateRequiredFields } = require('../validators/common');

/**
 * Get all barbers for a barbershop
 */
const getBarbersByBranch = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    
    validateRequiredFields({ branchId }, ['branchId']);
    
    const barbers = await Barber.findAll({
      where: { 
        branch_id: branchId, 
        is_active: true 
      },
      include: [
        { 
          model: User,
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: BarberAvailability
        }
      ]
    });
    
    successResponse(res, barbers, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Add a barber to a barbershop
 */
const addBarberToBranch = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { branchId } = req.params;
    const { user_id, availabilities } = req.body;

    if (!user_id) {
      throw ApiError.badRequest('User ID is required');
    }
    
    // Verify branch exists
    const branch = await Branch.findByPk(branchId, { transaction });
    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }
    
    // Verify user exists
    const user = await User.findByPk(user_id, { transaction });
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    // Check if user is already a barber
    const existingBarber = await Barber.findOne({ 
      where: { user_id },
      transaction
    });
    
    if (existingBarber) {
      throw ApiError.badRequest('User is already a barber');
    }
    
    // Ensure user has barber role
    const barberRole = await Role.findOne({
      where: { name: 'barber' },
      transaction
    });
    
    if (!barberRole) {
      throw ApiError.internal('Barber role not found');
    }

    if (user.role_id !== barberRole.id) {
      // Update user's role to barber
      await user.update({ role_id: barberRole.id }, { transaction });
    }
    
    // Create new barber
    const barber = await Barber.create({
      user_id,
      branch_id: branchId,
      is_active: true
    }, { transaction });
    
    // Add availabilities if provided
    if (availabilities && Array.isArray(availabilities)) {
      // Validate availability data
      availabilities.forEach(avail => {
        if (!avail.day_of_week || !avail.start_time || !avail.end_time) {
          throw ApiError.badRequest('Each availability must include day_of_week, start_time, and end_time');
        }
      });

      const availabilityData = availabilities.map(avail => ({
        barber_id: barber.id,
        day_of_week: avail.day_of_week,
        start_time: avail.start_time,
        end_time: avail.end_time
      }));
      
      await BarberAvailability.bulkCreate(availabilityData, { transaction });
    }
    
    await transaction.commit();
    
    logger.info('Barber added successfully', { barberId: barber.id });
    
    // Fetch the complete barber with associations
    const createdBarber = await Barber.findByPk(barber.id, {
      include: [
        { 
          model: User,
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: BarberAvailability
        }
      ]
    });
    
    createdResponse(res, createdBarber, req.startTime, 'Barber added successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Get barber availability
 */
const getBarberAvailability = async (req, res, next) => {
  try {
    const { branchId, barberId } = req.params;
    
    const barber = await Barber.findOne({
      where: { 
        id: barberId,
        branch_id: branchId,
        is_active: true
      }
    });
    
    if (!barber) {
      throw ApiError.notFound('Barber not found');
    }
    
    const availability = await BarberAvailability.findAll({
      where: { barber_id: barberId }
    });
    
    successResponse(res, availability, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Set barber availability
 */
const setBarberAvailability = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { branchId, barberId } = req.params;
    const { availabilities } = req.body;

    if (!availabilities || !Array.isArray(availabilities)) {
      throw ApiError.badRequest('Availabilities must be provided as an array');
    }
    
    // Verify barber exists and belongs to the branch
    const barber = await Barber.findOne({
      where: { 
        id: barberId, 
        branch_id: branchId 
      },
      transaction
    });
    
    if (!barber) {
      throw ApiError.notFound('Barber not found');
    }
    
    // Check if the requesting user is authorized
    if (req.user.Role.name === 'barber' && barber.user_id !== req.user.id) {
      throw ApiError.forbidden('Not authorized to update this barber');
    }

    // Validate availability data
    availabilities.forEach(avail => {
      if (!avail.day_of_week || !avail.start_time || !avail.end_time) {
        throw ApiError.badRequest('Each availability must include day_of_week, start_time, and end_time');
      }
    });
    
    // Delete existing availabilities
    await BarberAvailability.destroy({
      where: { barber_id: barberId },
      transaction
    });
    
    // Create new availabilities
    const availabilityData = availabilities.map(avail => ({
      barber_id: barberId,
      day_of_week: avail.day_of_week,
      start_time: avail.start_time,
      end_time: avail.end_time
    }));
    
    await BarberAvailability.bulkCreate(availabilityData, { transaction });
    await transaction.commit();
    
    logger.info('Barber availability updated', { barberId });
    
    const updatedAvailability = await BarberAvailability.findAll({
      where: { barber_id: barberId }
    });
    
    successResponse(res, updatedAvailability, req.startTime, 'Barber availability updated successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Get all barbers
 */
const getAllBarbers = async (req, res, next) => {
  try {
    const barbers = await Barber.findAll({
      where: { is_active: true },
      include: [
        { 
          model: User,
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: Branch,
          attributes: ['id', 'name', 'address']
        }
      ]
    });
    
    successResponse(res, barbers, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Get barber by ID
 */
const getBarberById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    validateRequiredFields({ id }, ['id']);
    
    const barber = await Barber.findByPk(id, {
      include: [
        { 
          model: User,
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: Barbershop,
          attributes: ['id', 'name', 'address']
        },
        {
          model: BarberAvailability
        }
      ]
    });
    
    if (!barber) {
      throw ApiError.notFound('Barber not found');
    }
    
    successResponse(res, barber, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Update barber status
 */
const updateBarberStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    validateRequiredFields({ id }, ['id']);
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      throw ApiError.badRequest('is_active must be a boolean value');
    }
    
    const barber = await Barber.findByPk(id);
    if (!barber) {
      throw ApiError.notFound('Barber not found');
    }
    
    await barber.update({ is_active });
    
    logger.info('Barber status updated', { 
      barberId: id, 
      newStatus: is_active 
    });
    
    successResponse(res, barber, req.startTime, `Barber ${is_active ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Get barber availability by ID
 */
const getBarberAvailabilityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    validateRequiredFields({ id }, ['id']);
    
    const barber = await Barber.findByPk(id);
    if (!barber) {
      throw ApiError.notFound('Barber not found');
    }
    
    const availability = await BarberAvailability.findAll({
      where: { barber_id: id }
    });
    
    successResponse(res, availability, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Set barber availability by ID
 */
const setBarberAvailabilityById = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    validateRequiredFields({ id }, ['id']);
    const availabilities = req.body;

    if (!availabilities || !Array.isArray(availabilities)) {
      throw ApiError.badRequest('Availabilities must be provided as an array');
    }
    
    const barber = await Barber.findByPk(id, { transaction });
    if (!barber) {
      throw ApiError.notFound('Barber not found');
    }
    
    // Check if the requesting user is authorized
    if (req.user.Role.name === 'barber') {
      const userBarber = await Barber.findOne({ 
        where: { user_id: req.user.id },
        transaction
      });
      
      if (!userBarber || userBarber.id !== parseInt(id)) {
        throw ApiError.forbidden('Not authorized to update this barber');
      }
    }

    // Validate availability data
    availabilities.forEach(avail => {
      if (avail.day_of_week === null || avail.day_of_week === undefined || !avail.start_time || !avail.end_time) {
        throw ApiError.badRequest('Each availability must include day_of_week, start_time, and end_time');
      }
    });
    
    // Delete existing availabilities
    await BarberAvailability.destroy({
      where: { barber_id: id },
      transaction
    });
    
    // Create new availabilities
    const availabilityData = availabilities.map(avail => ({
      barber_id: id,
      day_of_week: avail.day_of_week,
      start_time: avail.start_time,
      end_time: avail.end_time
    }));
    
    await BarberAvailability.bulkCreate(availabilityData, { transaction });
    await transaction.commit();
    
    logger.info('Barber availability updated', { barberId: id });
    
    const updatedAvailability = await BarberAvailability.findAll({
      where: { barber_id: id }
    });
    
    successResponse(res, updatedAvailability, req.startTime, 'Barber availability updated successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Get services offered by a barber
 */
const getBarberServices = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    validateRequiredFields({ id }, ['id']);
    
    const barber = await Barber.findByPk(id);
    if (!barber) {
      throw ApiError.notFound('Barber not found');
    }
    
    const services = await Service.findAll({
      include: [{
        model: Barber,
        where: { id },
        attributes: []
      }]
    });
    
    successResponse(res, services, req.startTime);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBarbersByBranch,
  addBarberToBranch,
  getBarberAvailability,
  setBarberAvailability,
  getAllBarbers,
  getBarberById,
  updateBarberStatus,
  getBarberAvailabilityById,
  setBarberAvailabilityById,
  getBarberServices
};