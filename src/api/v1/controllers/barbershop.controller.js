const { Barbershop, BarbershopOpenDay, User } = require('../../models');

/**
 * Get all barbershops
 */
const getAllBarbershops = async (req, res) => {
  try {
    const barbershops = await Barbershop.findAll({
      where: { is_active: true },
      include: [{ model: BarbershopOpenDay }]
    });
    
    res.json(barbershops);
  } catch (error) {
    console.error('Error fetching barbershops:', error);
    res.status(500).json({ message: 'Error fetching barbershops' });
  }
};

/**
 * Get barbershop by ID
 */
const getBarbershopById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const barbershop = await Barbershop.findByPk(id, {
      include: [
        { model: BarbershopOpenDay }
      ]
    });
    
    if (!barbershop) {
      return res.status(404).json({ message: 'Barbershop not found' });
    }
    
    res.json(barbershop);
  } catch (error) {
    console.error('Error fetching barbershop:', error);
    res.status(500).json({ message: 'Error fetching barbershop' });
  }
};

/**
 * Create a new barbershop
 */
const createBarbershop = async (req, res) => {
  try {
    const { 
      name, 
      address, 
      email, 
      phone, 
      open_days 
    } = req.body;
    
    // Create barbershop
    const barbershop = await Barbershop.create({
      name,
      address,
      email,
      phone
    });
    
    // Create open days if provided
    if (open_days && Array.isArray(open_days)) {
      const openDaysData = open_days.map(day => ({
        barbershop_id: barbershop.id,
        day_of_week: day.day_of_week,
        opening_time: day.opening_time,
        closing_time: day.closing_time
      }));
      
      await BarbershopOpenDay.bulkCreate(openDaysData);
    }
    
    // Owner association is handled by your existing role system
    
    // Get the complete barbershop with associations
    const createdBarbershop = await Barbershop.findByPk(barbershop.id, {
      include: [{ model: BarbershopOpenDay }]
    });
    
    res.status(201).json({
      message: 'Barbershop created successfully',
      barbershop: createdBarbershop
    });
  } catch (error) {
    console.error('Error creating barbershop:', error);
    res.status(500).json({ message: 'Error creating barbershop' });
  }
};

/**
 * Update barbershop
 */
const updateBarbershop = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      address, 
      email, 
      phone, 
      open_days 
    } = req.body;
    
    const barbershop = await Barbershop.findByPk(id);
    if (!barbershop) {
      return res.status(404).json({ message: 'Barbershop not found' });
    }
    
    // Update barbershop fields
    await barbershop.update({
      name: name || barbershop.name,
      address: address || barbershop.address,
      email: email || barbershop.email,
      phone: phone || barbershop.phone
    });
    
    // Update open days if provided
    if (open_days && Array.isArray(open_days)) {
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
    
    // Get the updated barbershop
    const updatedBarbershop = await Barbershop.findByPk(id, {
      include: [{ model: BarbershopOpenDay }]
    });
    
    res.json({
      message: 'Barbershop updated successfully',
      barbershop: updatedBarbershop
    });
  } catch (error) {
    console.error('Error updating barbershop:', error);
    res.status(500).json({ message: 'Error updating barbershop' });
  }
};

/**
 * Delete barbershop
 */
const deleteBarbershop = async (req, res) => {
  try {
    const { id } = req.params;
    
    const barbershop = await Barbershop.findByPk(id);
    if (!barbershop) {
      return res.status(404).json({ message: 'Barbershop not found' });
    }
    
    // Soft delete by setting is_active to false
    await barbershop.update({ is_active: false });
    res.json({ message: 'Barbershop deleted successfully' });
  } catch (error) {
    console.error('Error deleting barbershop:', error);
    res.status(500).json({ message: 'Error deleting barbershop' });
  }
};

module.exports = {
  getAllBarbershops,
  getBarbershopById,
  createBarbershop,
  updateBarbershop,
  deleteBarbershop
};