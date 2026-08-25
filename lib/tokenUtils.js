const crypto = require('crypto');
const bcrypt = require('bcrypt');

const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const hashToken = async(token) => {
    return bcrypt.hash(token, 10);
};

const verifyToken = async (token, tokenHash) => {
    return bcrypt.compare(token, tokenHash);
};

module.exports = {
    generateToken, 
    hashToken,
    verifyToken,
}