const { Barbershop, Branch, Barber, Service, BarbershopOpenDay, sequelize } = require('../../../models');
const ApiError = require('../../../utils/errors/api-error');
const logger = require('../../../utils/logger');
const { validateRequiredFields, validateEmail, validatePhone } = require('../validators/common');
const { validateAvailability } = require('../validators/barbershop');
const { successResponse, createdResponse } = require('../../../utils/response');

/**
 * Get all barbershops
 */
const getAllBarbershops = async (req, res, next) => {
  try {
    const barbershops = await Barbershop.findAll({
      where: { is_active: true },
      include: [{ 
        model: Branch,
        where: { is_active: true },
        required: false,
        include: [{
          model: Service,
          where: { is_active: true },
          required: false
        }]
      }]
    });
    
    successResponse(res, barbershops, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Get barbershop by ID
 */
const getBarbershopById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const barbershop = await Barbershop.findByPk(id, {
      include: [{ 
        model: Branch,
        where: { is_active: true },
        required: false,
        include: [{
          model: Service,
          where: { is_active: true },
          required: false
        }]
      }]
    });
    
    if (!barbershop) {
      throw ApiError.notFound('Barbershop not found');
    }
    
    successResponse(res, barbershop, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new barbershop
 */
const createBarbershop = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, address, email, phone, open_days } = req.body;
    
    // Validate required fields
    validateRequiredFields({ name, address, email, phone }, ['name', 'address', 'email', 'phone']);
    validateEmail(email);
    validatePhone(phone);
    
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
    
    // Create barbershop
    const barbershop = await Barbershop.create({
      name,
      address,
      email,
      phone
    }, { transaction });

    // Create main branch with provided details
    const mainBranch = await Branch.create({
      barbershop_id: barbershop.id,
      name: `${name} - Main Branch`,
      address,
      email,
      phone,
      is_active: true
    }, { transaction });

    // Create open days for the main branch if provided
    if (open_days && open_days.length > 0) {
      const openDaysData = open_days.map(day => ({
        branch_id: mainBranch.id,
        day_of_week: day.day_of_week,
        opening_time: day.opening_time,
        closing_time: day.closing_time
      }));
      
      await BarbershopOpenDay.bulkCreate(openDaysData, { transaction });
    }

    // Add owner as a barber in the main branch
    await Barber.create({
      user_id: req.user.id,
      branch_id: mainBranch.id,
      is_active: true
    }, { transaction });
    
    await transaction.commit();
    
    logger.info('Barbershop and main branch created successfully', { 
      barbershopId: barbershop.id,
      branchId: mainBranch.id,
      ownerId: req.user.id 
    });
    
    // Get the complete barbershop with associations
    const createdBarbershop = await Barbershop.findByPk(barbershop.id, {
      include: [{ 
        model: Branch,
        where: { is_active: true },
        required: false,
        include: [{
          model: Service,
          where: { is_active: true },
          required: false
        }]
      }]
    });
    
    createdResponse(res, createdBarbershop, req.startTime, 'Barbershop created successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Update barbershop
 */
const updateBarbershop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    
    const barbershop = await Barbershop.findByPk(id);
    if (!barbershop) {
      throw ApiError.notFound('Barbershop not found');
    }
    
    // Validate fields if provided
    if (email) validateEmail(email);
    if (phone) validatePhone(phone);
    
    // Update barbershop fields
    await barbershop.update({
      name: name || barbershop.name,
      email: email || barbershop.email,
      phone: phone || barbershop.phone
    });
    
    logger.info('Barbershop updated successfully', { barbershopId: id });
    
    // Get the updated barbershop
    const updatedBarbershop = await Barbershop.findByPk(id, {
      include: [{ 
        model: Branch,
        where: { is_active: true },
        required: false,
        include: [{
          model: Service,
          where: { is_active: true },
          required: false
        }]
      }]
    });
    
    successResponse(res, updatedBarbershop, req.startTime, 'Barbershop updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete barbershop
 */
const deleteBarbershop = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const barbershop = await Barbershop.findByPk(id, { transaction });
    if (!barbershop) {
      throw ApiError.notFound('Barbershop not found');
    }
    
    // Soft delete barbershop and all its branches
    await barbershop.update({ is_active: false }, { transaction });
    await Branch.update(
      { is_active: false },
      { 
        where: { barbershop_id: id },
        transaction
      }
    );
    
    await transaction.commit();
    
    logger.info('Barbershop and all branches deleted successfully', { barbershopId: id });
    
    successResponse(res, null, req.startTime, 'Barbershop deleted successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  getAllBarbershops,
  getBarbershopById,
  createBarbershop,
  updateBarbershop,
  deleteBarbershop
};