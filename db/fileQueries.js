const prisma = require('../lib/prisma');

async function getAllFiles(userId, folderId){
    return prisma.file.findMany({
        where: {
            uploadedById: userId,
            folderId,
            status: {
                in: ["READY"]
            }
        },
        orderBy: {
            createdAt: 'asc',
        }
    });
}


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
    getAllFiles,
}