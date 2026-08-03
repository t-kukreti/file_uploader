const uploadQueries = require('../db/uploadQueries');

const getFileUpload = (req,res)=>{

    res.render('fileUpload',{
        folderId: req.query.folderId ?? null,
    });
};

const postFileUpload = async(req,res,next)=>{
    try{
        // handle duplication later.
        await uploadQueries.uploadInDb({
            originalName: req.file.originalname,
        fileName: req.file.filename,
        path: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedById: req.user.id,
        folderId: req.body.folderId ? Number(req.body.folderId) : null,
    });
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