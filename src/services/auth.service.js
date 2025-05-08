const { User, Role } = require('../models');

class AuthService {
    async validateUser(userId) {
        return User.findByPk(userId, {
            include: [{ model: Role, attributes: ['name'] }]
        });
    }

    async findUserByEmail(email) {
        return User.findOne({
            where: { email },
            include: [{ model: Role, attributes: ['name'] }]
        });
    }
}

module.exports = new AuthService();