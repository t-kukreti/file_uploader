const prisma = require('../lib/prisma');

const findUserByEmail = async(email) => {
    const user = await prisma.user.findUnique({
        where:{
            email // same as email: email
        }
    });
    return user;
};

const updateTokenById = async (id, tokenExpiry, tokenHash) => {
    return prisma.user.update({
        where: {
            id,
        },
        data:{
            tokenExpiry,
            tokenHash
        },

    });
};

const findUserById = async(id) => {
    return await prisma.user.findUnique({
        where: {
            id
        }
    });
};

const addUser = async (email, passwordHash, tokenExpiry, tokenHash) => {
    return prisma.user.create({
        data: {
            email,
            passwordHash,
            tokenExpiry,
            tokenHash
        }
    });
};
const verifyEmail = async(id) => {
    return prisma.user.update({
        where: {
            id,
        },
        data: {
            emailVerified: true,
            tokenExpiry: null,
            tokenHash: null
        },
    });
};


module.exports ={
    findUserByEmail,
    addUser,
    findUserById,
    verifyEmail,
    updateTokenById,
    
}