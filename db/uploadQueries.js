const prisma = require('../lib/prisma');

async function uploadInDb(data){
    return prisma.file.create({
        data,
    });
};

module.exports = {
    uploadInDb,
}