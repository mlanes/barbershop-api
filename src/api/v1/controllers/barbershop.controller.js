const { Barbershop, BarbershopOpenDay, Barber, sequelize } = require('../../../models');
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
      include: [{ model: BarbershopOpenDay }]
    });
    
    successResponse(res, barbershops);
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
      include: [{ model: BarbershopOpenDay }]
    });
    
    if (!barbershop) {
      throw ApiError.notFound('Barbershop not found');
    }
    
    successResponse(res, barbershop);
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
    
    // Create open days if provided
    if (open_days && open_days.length > 0) {
      const openDaysData = open_days.map(day => ({
        barbershop_id: barbershop.id,
        day_of_week: day.day_of_week,
        opening_time: day.opening_time,
        closing_time: day.closing_time
      }));
      
      await BarbershopOpenDay.bulkCreate(openDaysData, { transaction });
    }

    // Add owner as a barber in the barbershop
    await Barber.create({
      user_id: req.user.id,
      barbershop_id: barbershop.id,
      is_active: true
    }, { transaction });
    
    await transaction.commit();
    
    logger.info('Barbershop created successfully', { 
      barbershopId: barbershop.id,
      ownerId: req.user.id 
    });
    
    // Get the complete barbershop with associations
    const createdBarbershop = await Barbershop.findByPk(barbershop.id, {
      include: [{ model: BarbershopOpenDay }]
    });
    
    createdResponse(res, createdBarbershop, 'Barbershop created successfully');
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
    const { name, address, email, phone, open_days } = req.body;
    
    const barbershop = await Barbershop.findByPk(id);
    if (!barbershop) {
      throw ApiError.notFound('Barbershop not found');
    }
    
    // Validate fields if provided
    if (email) validateEmail(email);
    if (phone) validatePhone(phone);
    
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
    
    // Update barbershop fields
    await barbershop.update({
      name: name || barbershop.name,
      address: address || barbershop.address,
      email: email || barbershop.email,
      phone: phone || barbershop.phone
    });
    
    // Update open days if provided
    if (open_days && open_days.length > 0) {
      // Remove existing open days
      await BarbershopOpenDay.destroy({ where: { barbershop_id: id } });
      
      // Create new open days
      const openDaysData = open_days.map(day => ({
        barbershop_id: barbershop.id,
        day_of_week: day.day_of_week,
        opening_time: day.opening_time,
        closing_time: day.closing_time
      }));
      
      await BarbershopOpenDay.bulkCreate(openDaysData);
    }
    
    logger.info('Barbershop updated successfully', { barbershopId: id });
    
    // Get the updated barbershop
    const updatedBarbershop = await Barbershop.findByPk(id, {
      include: [{ model: BarbershopOpenDay }]
    });
    
    successResponse(res, updatedBarbershop, 'Barbershop updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete barbershop
 */
const deleteBarbershop = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const barbershop = await Barbershop.findByPk(id);
    if (!barbershop) {
      throw ApiError.notFound('Barbershop not found');
    }
    
    // Soft delete by setting is_active to false
    await barbershop.update({ is_active: false });
    
    logger.info('Barbershop deleted successfully', { barbershopId: id });
    
    successResponse(res, null, 'Barbershop deleted successfully');
  } catch (error) {
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