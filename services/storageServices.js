const supabase = require('../lib/supabase');
const fs = require('fs');

const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const r2Client = require('../lib/r2');

async function uploadToSupabase(file){
    const {data, error} = await supabase.storage.from('uploads').upload(
        file.filename,
        fs.createReadStream(file.path),
        {contentType: file.mimetype},
    );

    if(error){
        throw error;
    }
    return data;
};

async function deleteFilesFromSupabase(paths){
    if(paths.length === 0) return;
    const {error} = await supabase.storage.from('uploads').remove(paths);
    if(error){
        throw error;
    }

};

async function downloadFileFromSupabase(path, originalName){
    const{data, error} = await supabase.storage.from('uploads').createSignedUrl(path,60,{
        download: originalName,
    });

    if(error){
        throw error;
    }

    return data.signedUrl;
};

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

module.exports = {
    uploadToSupabase,
    deleteFilesFromSupabase,
    downloadFileFromSupabase,
    downloadFileFromR2,
}