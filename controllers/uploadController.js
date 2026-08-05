const uploadQueries = require('../db/uploadQueries');
const folderQueries = require('../db/folderQueries');
const storageServices = require('../services/storageServices');
const fs = require('fs');




const getFileUpload = async(req,res,next)=>{
    try{
        let folder = null;
        if(req.query.folderId){
            folder = await folderQueries.getFolderById(Number(req.query.folderId),req.user.id);
        }

        res.render('fileUpload',{
        folder,
        errors: req.flash("errors"),
    });
    }catch(err){
        return next(err);
    }

};

const postFileUpload = async(req,res,next)=>{

    try{
        // upload the file to supabase
        const uploadData = await storageServices.uploadToSupabase(req.file);

        // upload metadata to db
        
        // handle duplication later.
        await uploadQueries.uploadInDb({
        originalName: req.file.originalname,
        fileName: req.file.filename,
        path: uploadData.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedById: req.user.id,
        folderId: req.body.folderId ? Number(req.body.folderId) : null,
    });

    // remove the file from uploads
    await fs.promises.unlink(req.file.path);

    if(req.body.folderId){
        return res.redirect(`/folders/${req.body.folderId}`);
    }
    return res.redirect('/');
}catch(err){
    next(err);
}
};

module.exports = {
    getFileUpload,
    postFileUpload,

}