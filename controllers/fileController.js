const fileQueries = require('../db/fileQueries');
const storageServices = require('../services/storageServices');

const {renameFileValidation} = require('../validators/commonValidators');
const { validationResult, matchedData } = require('express-validator');






const viewFile = async(req,res,next)=>{
    try{
        const file = await fileQueries.getFileById(Number(req.params.id),req.user.id);
        if(!file){
            return res.sendStatus(404);
        }
        res.render('viewFile',{file, errors: req.flash("errors")});
    }catch(err){
        return next(err);
    }
};

const downloadFile = async(req,res,next)=>{
    try{

        const file = await fileQueries.getFileById(Number(req.params.id), req.user.id);
        
        if(!file){
            return res.sendStatus(404);
        }
        // think about letting the user decide the path, via the saveAs dialog.
        const signedUrl = await storageServices.downloadFileFromSupabase(file.path, file.originalName);
        return res.redirect(signedUrl);

    }catch(err){
        return next(err);
    }
};

const deleteFile = async(req,res,next)=>{
    try{
        const file = await fileQueries.getFileById(Number(req.params.id), req.user.id);
        
        if(!file){
            return res.sendStatus(404);
        }

        // delete file from supabase
        await storageServices.deleteFilesFromSupabase([file.path]);
        // delete record from db
        await fileQueries.deleteFileById(file.id);

        return res.redirect(req.body.redirectTo || '/');
    }catch(err){
        return next(err);
    }
};

const renameFile = [
    renameFileValidation,

async(req,res,next)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("errors", errors.array());
            return res.redirect(req.body.redirectTo || '/');
        }
        const file = await fileQueries.getFileById(Number(req.params.id),req.user.id);

        if(!file){
            return res.sendStatus(404);
        }
        const {newFileName} = matchedData(req);


        await fileQueries.renameFileById(file.id,{
            originalName: newFileName,
        });
        
        return res.redirect(req.body.redirectTo || '/');

    }catch(err){
        return next(err);
    }
}
];


module.exports = {
    downloadFile,
    deleteFile,
    renameFile,
    viewFile,

}