const validateToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    if (!token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    next();
};

module.exports = {
    validateToken
};