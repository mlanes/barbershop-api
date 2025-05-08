const { Appointment, Barber, Service } = require('../models');

class AppointmentService {
    async create(appointmentData) {
        return Appointment.create(appointmentData);
    }

    async findAll(filters = {}) {
        return Appointment.findAll({
            where: filters,
            include: [Barber, Service]
        });
    }

    async findById(id) {
        return Appointment.findByPk(id, {
            include: [Barber, Service]
        });
    }

    async update(id, updateData) {
        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        return appointment.update(updateData);
    }

    async delete(id) {
        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        return appointment.destroy();
    }
}

module.exports = new AppointmentService();