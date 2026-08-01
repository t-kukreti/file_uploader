const prisma = require('../lib/prisma');

const findUserByEmail = async(email) => {
    const user = await prisma.user.findUnique({
        where:{
            email // same as email: email
        }
    });
    return user;
};

const findUserById = async(id) => {
    return await prisma.user.findUnique({
        where: {
            id
        }
    });
};

const addUser = async (email, passwordHash) => {
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
        }
    });
};


module.exports ={
    findUserByEmail,
    addUser,
    findUserById,
    
}