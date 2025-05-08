const { Barber, User, BarberAvailability, Barbershop, Role, Service } = require('../../models');
const { sequelize } = require('../../models');

/**
 * Get all barbers for a barbershop
 */
const getBarbersByBarbershop = async (req, res) => {
  try {
    const { barbershopId } = req.params;
    
    const barbers = await Barber.findAll({
      where: { 
        barbershop_id: barbershopId, 
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
    
    res.json(barbers);
  } catch (error) {
    console.error('Error fetching barbers:', error);
    res.status(500).json({ message: 'Error fetching barbers' });
  }
};

/**
 * Add a barber to a barbershop
 */
const addBarber = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { barbershopId } = req.params;
    const { user_id, availabilities } = req.body;
    
    // Verify barbershop exists
    const barbershop = await Barbershop.findByPk(barbershopId, { transaction });
    if (!barbershop) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Barbershop not found' });
    }
    
    // Verify user exists
    const user = await User.findByPk(user_id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is already a barber
    const existingBarber = await Barber.findOne({ 
      where: { user_id },
      transaction
    });
    
    if (existingBarber) {
      await transaction.rollback();
      return res.status(400).json({ message: 'User is already a barber' });
    }
    
    // Ensure user has barber role
    const barberRole = await Role.findOne({
      where: { name: 'barber' },
      transaction
    });
    
    if (user.role_id !== barberRole.id) {
      // Update user's role to barber
      await user.update({ role_id: barberRole.id }, { transaction });
    }
    
    // Create new barber
    const barber = await Barber.create({
      user_id,
      barbershop_id: barbershopId,
      is_active: true
    }, { transaction });
    
    // Add availabilities if provided
    if (availabilities && Array.isArray(availabilities)) {
      const availabilityData = availabilities.map(avail => ({
        barber_id: barber.id,
        day_of_week: avail.day_of_week,
        start_time: avail.start_time,
        end_time: avail.end_time
      }));
      
      await BarberAvailability.bulkCreate(availabilityData, { transaction });
    }
    
    await transaction.commit();
    
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
    
    res.status(201).json({
      message: 'Barber added successfully',
      barber: createdBarber
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error adding barber:', error);
    res.status(500).json({ message: 'Error adding barber' });
  }
};

/**
 * Get barber availability
 */
const getBarberAvailability = async (req, res) => {
  try {
    const { barbershopId, barberId } = req.params;
    
    const barber = await Barber.findOne({
      where: { 
        id: barberId,
        barbershop_id: barbershopId,
        is_active: true
      }
    });
    
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }
    
    const availability = await BarberAvailability.findAll({
      where: { barber_id: barberId }
    });
    
    res.json(availability);
  } catch (error) {
    console.error('Error fetching barber availability:', error);
    res.status(500).json({ message: 'Error fetching barber availability' });
  }
};

/**
 * Set barber availability
 */
const setBarberAvailability = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { barbershopId, barberId } = req.params;
    const { availabilities } = req.body;
    
    // Verify barber exists and belongs to the barbershop
    const barber = await Barber.findOne({
      where: { 
        id: barberId, 
        barbershop_id: barbershopId 
      },
      transaction
    });
    
    if (!barber) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Barber not found' });
    }
    
    // Check if the requesting user is authorized
    // Owner can update any barber, barbers can only update their own
    if (req.user.Role.name === 'barber' && barber.user_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ message: 'Not authorized to update this barber' });
    }
    
    // Delete existing availabilities
    await BarberAvailability.destroy({
      where: { barber_id: barberId },
      transaction
    });
    
    // Create new availabilities
    if (availabilities && Array.isArray(availabilities)) {
      const availabilityData = availabilities.map(avail => ({
        barber_id: barberId,
        day_of_week: avail.day_of_week,
        start_time: avail.start_time,
        end_time: avail.end_time
      }));
      
      await BarberAvailability.bulkCreate(availabilityData, { transaction });
    }
    
    await transaction.commit();
    
    const updatedAvailability = await BarberAvailability.findAll({
      where: { barber_id: barberId }
    });
    
    res.json({
      message: 'Barber availability updated successfully',
      availability: updatedAvailability
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating barber availability:', error);
    res.status(500).json({ message: 'Error updating barber availability' });
  }
};

/**
 * Get all barbers
 */
const getAllBarbers = async (req, res) => {
  try {
    const barbers = await Barber.findAll({
      where: { is_active: true },
      include: [
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
    console.error('Error fetching barbers:', error);
    res.status(500).json({ message: 'Error fetching barbers' });
  }
};

/**
 * Get barber by ID
 */
const getBarberById = async (req, res) => {
  try {
    const { id } = req.params;
    
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
      return res.status(404).json({ message: 'Barber not found' });
    }
    
    res.json(barber);
  } catch (error) {
    console.error('Error fetching barber:', error);
    res.status(500).json({ message: 'Error fetching barber' });
  }
};

/**
 * Update barber status (active/inactive)
 */
const updateBarberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const barber = await Barber.findByPk(id);
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }
    
    await barber.update({ is_active });
    
    res.json({
      message: `Barber ${is_active ? 'activated' : 'deactivated'} successfully`,
      barber
    });
  } catch (error) {
    console.error('Error updating barber status:', error);
    res.status(500).json({ message: 'Error updating barber status' });
  }
};

/**
 * Get barber availability by barber ID
 */
const getBarberAvailabilityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const barber = await Barber.findByPk(id);
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }
    
    const availability = await BarberAvailability.findAll({
      where: { barber_id: id }
    });
    
    res.json(availability);
  } catch (error) {
    console.error('Error fetching barber availability:', error);
    res.status(500).json({ message: 'Error fetching barber availability' });
  }
};

/**
 * Set barber availability by barber ID
 */
const setBarberAvailabilityById = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { availabilities } = req.body;
    
    const barber = await Barber.findByPk(id, { transaction });
    if (!barber) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Barber not found' });
    }
    
    // Check if the requesting user is authorized
    if (req.user.Role.name === 'barber') {
      const userBarber = await Barber.findOne({ 
        where: { user_id: req.user.id },
        transaction
      });
      
      if (!userBarber || userBarber.id !== parseInt(id)) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Not authorized to update this barber' });
      }
    }
    
    // Delete existing availabilities
    await BarberAvailability.destroy({
      where: { barber_id: id },
      transaction
    });
    
    // Create new availabilities
    if (availabilities && Array.isArray(availabilities)) {
      const availabilityData = availabilities.map(avail => ({
        barber_id: id,
        day_of_week: avail.day_of_week,
        start_time: avail.start_time,
        end_time: avail.end_time
      }));
      
      await BarberAvailability.bulkCreate(availabilityData, { transaction });
    }
    
    await transaction.commit();
    
    const updatedAvailability = await BarberAvailability.findAll({
      where: { barber_id: id }
    });
    
    res.json({
      message: 'Barber availability updated successfully',
      availability: updatedAvailability
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating barber availability:', error);
    res.status(500).json({ message: 'Error updating barber availability' });
  }
};

/**
 * Get services offered by a barber
 */
const getBarberServices = async (req, res) => {
  try {
    const { id } = req.params;
    
    const barber = await Barber.findByPk(id);
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }
    
    const services = await Service.findAll({
      include: [{
        model: Barber,
        where: { id },
        attributes: []
      }]
    });
    
    res.json(services);
  } catch (error) {
    console.error('Error fetching barber services:', error);
    res.status(500).json({ message: 'Error fetching barber services' });
  }
};

module.exports = {
  getBarbersByBarbershop,
  addBarber,
  getBarberAvailability,
  setBarberAvailability,
  getAllBarbers,
  getBarberById,
  updateBarberStatus,
  getBarberAvailabilityById,
  setBarberAvailabilityById,
  getBarberServices
};