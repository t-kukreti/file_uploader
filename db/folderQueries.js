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
        }
    });
}

async function getFolderById(id){
    return prisma.folder.findUnique({
        where:{
            id,
        },
        include: {
            files: true,
        }
    });
}



module.exports = {
    createFolder,
    getFoldersByOwner,
    getFolderById,
}










