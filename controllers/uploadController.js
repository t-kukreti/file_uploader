const uploadQueries = require('../db/uploadQueries');
const storageServices = require('../services/storageServices');
const fs = require('fs');




const getFileUpload = (req,res)=>{

    res.render('fileUpload',{
        folderId: req.query.folderId ?? null,
        errors: req.flash("errors"),
    });
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