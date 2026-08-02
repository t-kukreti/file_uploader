const fileQueries = require('../db/fileQueries');
const fs = require('fs/promises');

const downloadFile = async(req,res,next)=>{
    try{

        const file = await fileQueries.getFileById(Number(req.params.id), req.user.id);
        
        if(!file){
            return res.sendStatus(404);
        }
        // think about letting the user decide the path, via the saveAs dialog.
        return res.download(file.path, file.originalName); 
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
        await fs.unlink(file.path);

        await fileQueries.deleteFileById(file.id);
        // change the redirection path to where the user were before deleting that file.
        return res.redirect('/');
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
        return res.redirect('/');

    }catch(err){
        return next(err);
    }
};


module.exports = {
    downloadFile,
    deleteFile,
    renameFile,

}