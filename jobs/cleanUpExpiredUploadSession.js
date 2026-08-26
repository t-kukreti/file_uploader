const cron = require('node-cron');
const { getExpiredUploadSessions } = require('../db/uploadQueries');
const { deleteFileById } = require('../db/fileQueries');
const { abortMultiPartUpload } = require('../services/uploadServices');

cron.schedule("* * * * * ", async() => {
    // get all expired upload session.
    const expiredSessions = await getExpiredUploadSessions();

    if(expiredSessions.length === 0) return ;

    await Promise.all(
        expiredSessions.map( async (session) => {
            
            const{ objectKey, uploadId, fileId } = session;
            await abortMultiPartUpload(objectKey, uploadId);
            await deleteFileById(fileId);

            console.log(`deleted this file: ${fileId}`);

        }),
    );

});



