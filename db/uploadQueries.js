const prisma = require('../lib/prisma');

async function uploadInDb(data){
    return prisma.file.create({
        data,
    });
};

async function getRootFiles(userId){
    return prisma.file.findMany({
        where: {
            uploadedById: userId,
            folderId: null,
        }
    });
}

module.exports = {
    uploadInDb,
    getRootFiles,
}