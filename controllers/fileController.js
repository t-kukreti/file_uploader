const fileQueries = require('../db/fileQueries');
const fs = require('fs/promises');
const storageServices = require('../services/storageServices');





const viewFile = async(req,res,next)=>{
    try{
        const file = await fileQueries.getFileById(Number(req.params.id),req.user.id);
        if(!file){
            return res.sendStatus(404);
        }
        res.render('viewFile',{file});
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
        await storageServices.deleteFileFromSupabase(file.path);
        // delete record from db
        await fileQueries.deleteFileById(file.id);

        return res.redirect(req.body.redirectTo || '/');
    }catch(err){
        return next(err);
    }
};

const renameFile = async(req,res,next)=>{
    try{
        const file = await fileQueries.getFileById(Number(req.params.id),req.user.id);

        if(!file){
            return res.sendStatus(404);
        }

        await fileQueries.renameFileById(file.id,{
            originalName: req.body.newFileName,
        });
        
        return res.redirect(req.body.redirectTo || '/');

    }catch(err){
        return next(err);
    }
};


module.exports = {
    downloadFile,
    deleteFile,
    renameFile,
    viewFile,

}