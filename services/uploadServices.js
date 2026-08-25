const { CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } = require('@aws-sdk/client-s3');

const r2Client = require('../lib/r2');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function multiPartInitialization(objectKey, mimeType){
    const command = new CreateMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: objectKey,
        ContentType: mimeType,
    });
    return await r2Client.send(command);
};

async function uploadPart(objectKey, uploadId, partNumber){
    const command = new UploadPartCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: objectKey,
        UploadId: uploadId,
        PartNumber: Number(partNumber),
    });
    return await getSignedUrl(r2Client, command, {expiresIn: 900});
};

async function completedMultiPartUpload(objectKey, uploadId, parts){
    const command = new CompleteMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: objectKey,
        UploadId: uploadId,

        MultipartUpload: {
            Parts: parts.map((part) => ({
                PartNumber: part.partNumber,
                ETag: part.etag,
            })),
        }
    });
    await r2Client.send(command);
}
module.exports = {
    multiPartInitialization,
    uploadPart,
    completedMultiPartUpload,

}