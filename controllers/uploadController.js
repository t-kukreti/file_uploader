const uploadQueries = require('../db/uploadQueries');
const folderQueries = require('../db/folderQueries');
const fileQueries = require('../db/fileQueries');

const { multiPartInitialization, uploadPart,  completedMultiPartUpload, abortMultiPartUpload } = require('../services/uploadServices');

const { randomUUID } = require('crypto');

const verifyUploadSession = async (uploadSessionId, userId) => {
    const uploadSession = await uploadQueries.getUploadSessionById(uploadSessionId, userId);

    if(! uploadSession){
        return null;
    }
    return uploadSession;
};

const getFileUpload = async (req, res, next) => {
    try {
        let folder = null;
        if (req.query.folderId) {
            folder = await folderQueries.getFolderById(Number(req.query.folderId), req.user.id);
        }

        const uploadSessionId = req.query.resume || null; 
        // verify the uploadSession
        if(uploadSessionId){
            const uploadSession = await verifyUploadSession(uploadSessionId, req.user.id);
            if(! uploadSession) return res.status(404).json({error: "Upload session not found"});
        }

        res.render('fileUpload', {
            folder,
            uploadSessionId,
            errors: req.flash("errors"),
        });
    } catch (err) {
        return next(err);
    }

};


const postFileUpload = async (req, res, next) => {
    try {
        // add validation later
        const { originalName, size, mimeType, folderId } = req.body;

        // R2 multipart initialization
        // generate an object key(unique) => uniquely identifies files stored in the r2 bucket

        const objectKey = `users/${req.user.id}/files/${randomUUID()}`;

        // create the multipart upload  // no single bit is sent(prepartion phase)
        const response = await multiPartInitialization(objectKey, mimeType);

        const uploadId = response.UploadId;
        const partSize = 50 * 1024 * 1024;

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // storing in db.
        const fileData = {
            originalName,
            objectKey,
            mimeType,
            size: BigInt(size),
            uploadedById: req.user.id,
            folderId: folderId ? Number(folderId) : null,
        };
        const uploadSessionData = {
            uploadId,
            objectKey,
            partSize,
            userId: req.user.id,
            expiresAt,
        };
        const { file, uploadSession } = await uploadQueries.createUploadRecords(fileData, uploadSessionData);

        return res.json({
            fileId: file.id,
            uploadSessionId: uploadSession.id,
            partSize,
        });

    } catch (err) {
        return next(err);
    }
};

const getPartUploadUrl = async (req, res, next) => {
    try {
        const { uploadSessionId, partNumber } = req.params;

        // veryify ownership
        if(uploadSessionId){
            const uploadSession = await verifyUploadSession(uploadSessionId, req.user.id);
            if(! uploadSession) return res.status(404).json({error: "Upload session not found"});

            const { objectKey, uploadId } = uploadSession;
            const signedUrl = await uploadPart(objectKey, uploadId, partNumber);

            // send the signed url back to the client.
            return res.json({
                signedUrl,
            });
        }else{
            return res.status(400).json({error: "No uploadSessionId was provided"});
        }

    } catch (err) {
        return next(err);
    }
};

const savePart = async (req, res, next) => {
    try {
        const { uploadSessionId, partNumber } = req.params;
        const { etag } = req.body;

        if (!etag) {
            return res.status(400).json({
                error: "ETag is required"
            });
        }

        if(uploadSessionId){
            const uploadSession = await verifyUploadSession(uploadSessionId, req.user.id);
            if(! uploadSession) return res.status(404).json({error: "Upload session not found"});
        }

        // put etag and partnumber in uploadParts db
        const part = await uploadQueries.saveUploadPart({
            uploadSessionId,
            partNumber: Number(partNumber),
            etag
        });

        res.json(part);

    } catch (err) {
        return next(err);
    }
};

const completeUpload = async (req, res, next) => {
    try {
        const { uploadSessionId } = req.params;

        const uploadSession = await verifyUploadSession(uploadSessionId, req.user.id);
        if(! uploadSession) return res.status(404).json({error: "Upload session not found"});

        const parts = await uploadQueries.getAllUploadParts(uploadSessionId);

        // check if its not a failed upload.
        const totalParts = Math.ceil(Number(uploadSession.file.size) / uploadSession.partSize);

        if (parts.length !== totalParts) {
            return res.status(400).json({
                error: "upload is incomplete"
            });
        }
        const { objectKey, uploadId } = uploadSession;
        
        await completedMultiPartUpload(objectKey, uploadId, parts);

        // change the file status in db
        await uploadQueries.markUploadComplete(uploadSession.fileId, uploadSession.id);

        return res.json({
            message: "upload complete"
        });

    } catch (err) {
        return next(err);
    }
};

const getUploadState = async (req, res, next) => {
    try{
        const { uploadSessionId } = req.params;

        const uploadSession = await verifyUploadSession(uploadSessionId, req.user.id);
        if(! uploadSession) return res.status(404).json({error: "Upload session not found"});

        const { partSize, file } = uploadSession;  
        // get parts
        const parts = await uploadQueries.getAllUploadParts(uploadSessionId);

        return res.json({
            message: "Upload state", 
            partSize,
            fileMetaData: {
                ...file,
                size: Number(file.size)
            },
            parts,
        });

    }catch(err){
        return next(err);
    }
};

const verifyFileUpload = async(req, res, next) => {
    try{
        // expres- validatora later. 
        const { metaDataToVerify } = req.body;
        const { uploadSessionId } = req.params;

        const uploadSession = await verifyUploadSession(uploadSessionId, req.user.id);
        if(! uploadSession) return res.status(404).json({error: "Upload session not found"});

        const { file } = uploadSession;
        const { originalName, mimeType, size} = metaDataToVerify;

        const sameFile = originalName === file.originalName && mimeType === file.mimeType && Number(size) === Number(file.size);
        return res.json({valid: sameFile});

    }catch(err){
        return next(err);
    }
};


const deleteIncompleteUpload = async (req, res, next) => {
    try{
        const { uploadSessionId } = req.params;
        const uploadSession = await verifyUploadSession(uploadSessionId, req.user.id);
        if(! uploadSession) return res.status(404).json({error: "Upload session not found"});

        const { objectKey, uploadId, fileId } = uploadSession;

        await abortMultiPartUpload(objectKey, uploadId);

        await fileQueries.deleteFileById(fileId); // 
        // await uploadQueries.deleteUploadSessionById(uploadSessionId);

        return res.sendStatus(204);

    }catch(err){
        return next(err);
    }
};

module.exports = {
    getFileUpload,
    postFileUpload,
    getPartUploadUrl,
    completeUpload,
    savePart,
    getUploadState,
    verifyFileUpload,
    deleteIncompleteUpload,
}