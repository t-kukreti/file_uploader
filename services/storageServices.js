const supabase = require('../lib/supabase');
const fs = require('fs');

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

module.exports = {
    uploadToSupabase,
    deleteFilesFromSupabase,
    downloadFileFromSupabase,
}