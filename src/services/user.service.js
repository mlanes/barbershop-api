const { User, Role } = require('../models');

class UserService {
    async create(userData) {
        return User.create(userData);
    }

    async findAll() {
        return User.findAll({
            include: [{ model: Role, attributes: ['name'] }]
        });
    }

    async findById(id) {
        return User.findByPk(id, {
            include: [{ model: Role, attributes: ['name'] }]
        });
    }

    async update(id, updateData) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user.update(updateData);
    }

    async delete(id) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user.destroy();
    }
}

module.exports = new UserService();