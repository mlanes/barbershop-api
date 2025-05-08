const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
};

const validateRequired = (value) => {
    return value !== undefined && value !== null && value !== '';
};

module.exports = {
    validateEmail,
    validatePhone,
    validateRequired
};