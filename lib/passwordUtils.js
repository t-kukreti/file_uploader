const bcrypt = require('bcrypt');

async function hashPassword(password){
    const saltRounds = 10;
    return await bcrypt.hash(password,saltRounds);
};

async function verifyPassword(passwrod, hash){
    return await bcrypt.compare(passwrod,hash);
};

module.exports = {
    hashPassword,
    verifyPassword,
}