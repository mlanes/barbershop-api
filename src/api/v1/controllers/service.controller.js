const { Service, Barbershop, BarberService, Barber, User } = require('../../../models');
const ApiError = require('../../../utils/errors/api-error');
const logger = require('../../../utils/logger');
const { validateServiceInput } = require('../validators/service');
const { validateRequiredFields } = require('../validators/common');
const { successResponse, createdResponse } = require('../../../utils/response');

/**
 * Get all services for a barbershop
 */
const getServicesByBarbershop = async (req, res, next) => {
  try {
    const { barbershopId } = req.params;
    
    const services = await Service.findAll({
      where: { 
        barbershop_id: barbershopId,
        is_active: true
      }
    });
    
    successResponse(res, services, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Add a service to a barbershop
 */
const addService = async (req, res, next) => {
  try {
    const { barbershopId } = req.params;
    const { name, duration, price } = req.body;
    
    // Validate input
    validateServiceInput({ name, duration, price });
    
    // Verify barbershop exists
    const barbershop = await Barbershop.findByPk(barbershopId);
    if (!barbershop) {
      throw ApiError.notFound('Barbershop not found');
    }
    
    // Create service
    const service = await Service.create({
      name,
      duration,
      price,
      barbershop_id: barbershopId
    });
    
    logger.info('Service added successfully', { 
      serviceId: service.id,
      barbershopId 
    });
    
    createdResponse(res, service, req.startTime, 'Service added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update a service
 */
const updateService = async (req, res, next) => {
  try {
    const { barbershopId, serviceId } = req.params;
    const { name, duration, price } = req.body;
    
    // Find service and ensure it belongs to the barbershop
    const service = await Service.findOne({
      where: {
        id: serviceId,
        barbershop_id: barbershopId
      }
    });
    
    if (!service) {
      throw ApiError.notFound('Service not found');
    }
    
    // Validate input if provided
    if (duration) validateServiceInput({ duration });
    if (price) validateServiceInput({ price });
    
    // Update service
    await service.update({
      name: name || service.name,
      duration: duration || service.duration,
      price: price || service.price
    });
    
    logger.info('Service updated successfully', { 
      serviceId,
      barbershopId 
    });
    
    successResponse(res, service, req.startTime, 'Service updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a service
 */
const deleteService = async (req, res, next) => {
  try {
    const { barbershopId, serviceId } = req.params;
    
    // Find service and ensure it belongs to the barbershop
    const service = await Service.findOne({
      where: {
        id: serviceId,
        barbershop_id: barbershopId
      }
    });
    
    if (!service) {
      throw ApiError.notFound('Service not found');
    }
    
    // Soft delete by setting is_active to false
    await service.update({ is_active: false });
    
    logger.info('Service deleted successfully', { 
      serviceId,
      barbershopId 
    });
    
    successResponse(res, null, req.startTime, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Assign service to barber
 */
const assignServiceToBarber = async (req, res, next) => {
  try {
    const { barbershopId, serviceId } = req.params;
    const { barber_id } = req.body;
    
    validateRequiredFields({ barber_id }, ['barber_id']);
    
    // Verify service exists and belongs to barbershop
    const service = await Service.findOne({
      where: {
        id: serviceId,
        barbershop_id: barbershopId
      }
    });
    
    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    // Verify barber exists and belongs to barbershop
    const barber = await Barber.findOne({
      where: {
        id: barber_id,
        barbershop_id: barbershopId
      }
    });

    if (!barber) {
      throw ApiError.notFound('Barber not found or not associated with this barbershop');
    }
    
    // Create barber-service association
    const barberService = await BarberService.create({
      barber_id,
      service_id: serviceId
    });
    
    logger.info('Service assigned to barber successfully', { 
      serviceId,
      barberId: barber_id 
    });
    
    createdResponse(res, barberService, req.startTime, 'Service assigned to barber successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all services
 */
const getAllServices = async (req, res, next) => {
  try {
    const services = await Service.findAll({
      where: { is_active: true },
      include: [{ model: Barbershop, attributes: ['id', 'name'] }]
    });
    
    successResponse(res, services);
  } catch (error) {
    next(error);
  }
};

/**
 * Get service by ID
 */
const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findByPk(id, {
      include: [{ model: Barbershop, attributes: ['id', 'name'] }]
    });
    
    if (!service) {
      throw ApiError.notFound('Service not found');
    }
    
    successResponse(res, service, req.startTime);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a service
 */
const createService = async (req, res, next) => {
  try {
    const { name, duration, price, barbershop_id } = req.body;
    
    // Validate input
    validateServiceInput({ name, duration, price });
    validateRequiredFields({ barbershop_id }, ['barbershop_id']);
    
    // Verify barbershop exists
    const barbershop = await Barbershop.findByPk(barbershop_id);
    if (!barbershop) {
      throw ApiError.notFound('Barbershop not found');
    }
    
    // Create service
    const service = await Service.create({
      name,
      duration,
      price,
      barbershop_id
    });
    
    logger.info('Service created successfully', { serviceId: service.id });
    
    createdResponse(res, service, req.startTime, 'Service created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update service by ID
 */
const updateServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, duration, price } = req.body;
    
    const service = await Service.findByPk(id);
    if (!service) {
      throw ApiError.notFound('Service not found');
    }
    
    // Validate input if provided
    if (duration) validateServiceInput({ duration });
    if (price) validateServiceInput({ price });
    
    await service.update({
      name: name || service.name,
      duration: duration || service.duration,
      price: price || service.price
    });
    
    logger.info('Service updated successfully', { serviceId: id });
    
    successResponse(res, service, req.startTime, 'Service updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete service by ID
 */
const deleteServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findByPk(id);
    if (!service) {
      throw ApiError.notFound('Service not found');
    }
    
    // Soft delete by setting is_active to false
    await service.update({ is_active: false });
    
    logger.info('Service deleted successfully', { serviceId: id });
    
    successResponse(res, null, req.startTime, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Assign service to barber by service ID
 */
const assignServiceToBarberById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { barber_id } = req.body;
    
    validateRequiredFields({ barber_id }, ['barber_id']);
    
    // Verify service exists
    const service = await Service.findByPk(id);
    if (!service) {
      throw ApiError.notFound('Service not found');
    }
    
    // Verify barber exists and belongs to same barbershop
    const barber = await Barber.findOne({
      where: {
        id: barber_id,
        barbershop_id: service.barbershop_id
      }
    });
    
    if (!barber) {
      throw ApiError.notFound('Barber not found or not associated with the service\'s barbershop');
    }
    
    // Create barber-service association
    const barberService = await BarberService.create({
      barber_id,
      service_id: id
    });
    
    logger.info('Service assigned to barber successfully', { 
      serviceId: id,
      barberId: barber_id 
    });
    
    createdResponse(res, barberService, req.startTime, 'Service assigned to barber successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get barbers who offer a specific service
 */
const getBarbersByService = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verify service exists
    const service = await Service.findByPk(id);
    if (!service) {
      throw ApiError.notFound('Service not found');
    }
    
    const barbers = await Barber.findAll({
      include: [
        {
          model: Service,
          where: { id },
          attributes: []
        },
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: Barbershop,
          attributes: ['id', 'name', 'address']
        }
      ]
    });
    
    successResponse(res, barbers, req.startTime);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServicesByBarbershop,
  addService,
  updateService,
  deleteService,
  assignServiceToBarber,
  getAllServices,
  getServiceById,
  createService,
  updateServiceById,
  deleteServiceById,
  assignServiceToBarberById,
  getBarbersByService
};