const { Barbershop, BarbershopOpenDay, Barber, Service } = require('../models');

class BarbershopService {
    async create(barbershopData) {
        return Barbershop.create(barbershopData);
    }

    async findAll() {
        return Barbershop.findAll({
            include: [
                { model: BarbershopOpenDay },
                { model: Barber, include: [Service] }
            ]
        });
    }

    async findById(id) {
        return Barbershop.findByPk(id, {
            include: [
                { model: BarbershopOpenDay },
                { model: Barber, include: [Service] }
            ]
        });
    }

    async update(id, updateData) {
        const barbershop = await Barbershop.findByPk(id);
        if (!barbershop) {
            throw new Error('Barbershop not found');
        }
        return barbershop.update(updateData);
    }

    async delete(id) {
        const barbershop = await Barbershop.findByPk(id);
        if (!barbershop) {
            throw new Error('Barbershop not found');
        }
        return barbershop.destroy();
    }
}

module.exports = new BarbershopService();