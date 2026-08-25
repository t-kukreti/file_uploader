const { PrismaClientExtends } = require('@prisma/client/extension');
const prisma = require('../lib/prisma');

async function createFolder(data){
    return prisma.folder.create({
        data,
    });
}

async function getFoldersByOwner(ownerId){
    return prisma.folder.findMany({
        where:{
            ownerId,
        },
        orderBy:{
            createdAt: 'asc',
        }
    });
}

async function getFolderById(id,userId){
    return prisma.folder.findFirst({
        where:{
            id,
            ownerId: userId,
        },
        include: {
            files: {
                where: {
                    status: {
                        in: ["READY"]
                    },
                },
                orderBy: {
                    createdAt: 'asc',
                }
            }
        }
    });
};

async function renameFolderById(id, newFolderName){
    return prisma.folder.update({
        where: {id},
        data:{
            name: newFolderName,
        }
    });
}
async function deleteFolderById(id){
    return prisma.folder.delete({
        where:{
            id,
        }
    });
}


module.exports = {
    createFolder,
    getFoldersByOwner,
    getFolderById,
    renameFolderById,
    deleteFolderById,
}










