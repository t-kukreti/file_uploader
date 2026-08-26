const prisma = require('../lib/prisma');

async function createUploadRecords(fileData, sessionData){
    return prisma.$transaction( async (tx) => {
        
        const file = await tx.file.create({
            data: fileData,
        });

        const uploadSession = await tx.uploadSession.create({
            data: {
                ...sessionData,
                fileId: file.id,
            },
        });

        return {file, uploadSession};
    });
};

async function markUploadComplete(fileId, uploadSessionId){
    return prisma.$transaction( async (tx) => {
        const file = await tx.file.update({
            where: {
                id: fileId,
            },
            data: {
                status: "READY",
            }
        })

        const uploadSession = await tx.uploadSession.update({
            where: {
                id: uploadSessionId,
            },
            data: {
                status: 'COMPLETED',
            }
        });

        return { file, uploadSession };
    });
}

async function getUploadSessionById(id, userId){
    return prisma.uploadSession.findFirst({
        where: {
            id, 
            userId,
        },
        include: {
            file: true,
        }
    });
}

async function saveUploadPart(data){
    const { uploadSessionId, partNumber } = data;

    return prisma.uploadPart.upsert({
        where: {
            uploadSessionId_partNumber: {
                uploadSessionId, 
                partNumber
            }
        },
        update: {
            etag: data.etag,
        },
        create: data,

    });
};

async function getAllUploadParts(uploadSessionId){
    return prisma.uploadPart.findMany({
        where: {
            uploadSessionId,
        },
        orderBy: {
            partNumber: 'asc',
        }
    });
};

async function uploadInDb(data){
    return prisma.file.create({
        data,
    });
};

async function getIncompleteUploads(userId){
    return prisma.uploadSession.findMany({
        where: {
            userId,
            status: {
                in: ['IN_PROGRESS', 'PAUSED'],
            },
        },
        include: {
            file: true,
            parts: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

const deleteUploadSessionById = async(id) => {
    return prisma.uploadSession.delete({
        where: {
            id,
        }
    });
};

module.exports = {
    uploadInDb,
    createUploadRecords,
    getUploadSessionById,
    markUploadComplete,
    saveUploadPart,
    getAllUploadParts,
    getIncompleteUploads,
    deleteUploadSessionById,
}