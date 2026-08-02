const prisma = require('../lib/prisma');

async function getFileById(id, userId){
    return prisma.file.findFirst({
        where:{
            id,
            uploadedById: userId,
        }
    })
}

async function deleteFileById(id){
    return prisma.file.delete({
        where:{
            id,
        }
    });
}

async function renameFileById(id,data){
    return prisma.file.update({
        where:{
            id,
        },
        data,
    })
}

module.exports = {
    getFileById,
    deleteFileById,
    renameFileById,
}