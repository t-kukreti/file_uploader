
const { GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const r2Client = require('../lib/r2');


async function downloadFileFromR2(obj_key, fileName) {
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: obj_key,
        ResponseContentDisposition: `attachment; filename="${fileName}"`
    });

    return getSignedUrl(r2Client, command, {
        expiresIn: 3600
    });
}

async function deleteFileFromR2(obj_key){
    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: obj_key,
    });
    await r2Client.send(command);
};

async function deleteFilesFromR2(objectKeys){
    if(objectKeys.length === 0) return ;
    const command = new DeleteObjectsCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Delete: {
            Objects: objectKeys.map((key)=>({
                Key: key,
            }))
        }
    });
    await r2Client.send(command);
};

module.exports = {
    downloadFileFromR2,
    deleteFileFromR2,
    deleteFilesFromR2,
}