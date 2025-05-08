const { Service, Barbershop, BarberService, Barber, User } = require('../../../models');

/**
 * Get all services for a barbershop
 */
const getServicesByBarbershop = async (req, res) => {
  try {
    const { barbershopId } = req.params;
    
    const services = await Service.findAll({
      where: { 
        barbershop_id: barbershopId,
        is_active: true
      }
    });
    
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Error fetching services' });
  }
};

/**
 * Add a service to a barbershop
 */
const addService = async (req, res) => {
  try {
    const { barbershopId } = req.params;
    const { name, duration, price } = req.body;
    
    // Verify barbershop exists
    const barbershop = await Barbershop.findByPk(barbershopId);
    if (!barbershop) {
      return res.status(404).json({ message: 'Barbershop not found' });
    }
    
    // Create service
    const service = await Service.create({
      name,
      duration,
      price,
      barbershop_id: barbershopId
    });
    
    res.status(201).json({
      message: 'Service added successfully',
      service
    });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ message: 'Error adding service' });
  }
};

/**
 * Update a service
 */
const updateService = async (req, res) => {
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
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Update service
    await service.update({
      name: name || service.name,
      duration: duration || service.duration,
      price: price || service.price
    });
    
    res.json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Error updating service' });
  }
};

/**
 * Delete a service
 */
const deleteService = async (req, res) => {
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
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Delete service
    // Soft delete by setting is_active to false instead of destroying the record
    await service.update({ is_active: false });
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Error deleting service' });
  }
};

/**
 * Assign service to barber
 */
const assignServiceToBarber = async (req, res) => {
  try {
    const { barbershopId, serviceId } = req.params;
    const { barber_id } = req.body;
    
    // Verify service exists and belongs to barbershop
    const service = await Service.findOne({
      where: {
        id: serviceId,
        barbershop_id: barbershopId
      }
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Create barber-service association
    const barberService = await BarberService.create({
      barber_id,
      service_id: serviceId
    });
    
    res.status(201).json({
      message: 'Service assigned to barber successfully',
      barberService
    });
  } catch (error) {
    console.error('Error assigning service to barber:', error);
    res.status(500).json({ message: 'Error assigning service to barber' });
  }
};

/**
 * Get all services
 */
const getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { is_active: true },
      include: [{ model: Barbershop, attributes: ['id', 'name'] }]
    });
    
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Error fetching services' });
  }
};

/**
 * Get service by ID
 */
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findByPk(id, {
      include: [{ model: Barbershop, attributes: ['id', 'name'] }]
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Error fetching service' });
  }
};

/**
 * Create a service
 */
const createService = async (req, res) => {
  try {
    const { name, duration, price, barbershop_id } = req.body;
    
    // Verify barbershop exists
    const barbershop = await Barbershop.findByPk(barbershop_id);
    if (!barbershop) {
      return res.status(404).json({ message: 'Barbershop not found' });
    }
    
    // Create service
    const service = await Service.create({
      name,
      duration,
      price,
      barbershop_id
    });
    
    res.status(201).json({
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Error creating service' });
  }
};

/**
 * Update service by ID
 */
const updateServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, price } = req.body;
    
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    await service.update({
      name: name || service.name,
      duration: duration || service.duration,
      price: price || service.price
    });
    
    res.json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Error updating service' });
  }
};

/**
 * Delete service by ID
 */
const deleteServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Soft delete by setting is_active to false instead of destroying the record
    await service.update({ is_active: false });
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Error deleting service' });
  }
};

/**
 * Assign service to barber by service ID
 */
const assignServiceToBarberById = async (req, res) => {
  try {
    const { id } = req.params;
    const { barber_id } = req.body;
    
    // Verify service exists
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Verify barber exists
    const barber = await Barber.findByPk(barber_id);
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }
    
    // Create barber-service association
    const barberService = await BarberService.create({
      barber_id,
      service_id: id
    });
    
    res.status(201).json({
      message: 'Service assigned to barber successfully',
      barberService
    });
  } catch (error) {
    console.error('Error assigning service to barber:', error);
    res.status(500).json({ message: 'Error assigning service to barber' });
  }
};

/**
 * Get barbers who offer a specific service
 */
const getBarbersByService = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify service exists
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
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
    
    res.json(barbers);
  } catch (error) {
    console.error('Error fetching barbers by service:', error);
    res.status(500).json({ message: 'Error fetching barbers by service' });
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