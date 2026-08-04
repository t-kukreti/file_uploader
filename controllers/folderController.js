const{validationResult, matchedData} = require('express-validator');
const folderQueries = require('../db/folderQueries');

const fileQueries = require('../db/fileQueries');
const storageServices = require('../services/storageServices');
const {renameFolderValidation, createFolderValidation} = require('../validators/commonValidators');

const getNewFolderForm = (req,res)=>{
    res.render('newFolder', {errors: req.flash("errors")});
};

const postNewFolderForm = [
    createFolderValidation,
    async(req, res, next)=>{
        const errors  = validationResult(req);
        if(!errors.isEmpty()){
            req.flash("errors", errors.array());
            return res.redirect('/folders/new');
        }

        try{
            const {folderName} = matchedData(req);
            await folderQueries.createFolder({
                name: folderName,
                ownerId: req.user.id,
            });
            return res.redirect('/');

        }catch(err){
            return next(err);
        }
    }
];

const getFolderById = async(req,res, next)=>{
    try{
        const folder = await folderQueries.getFolderById(Number(req.params.id),req.user.id);
        if(!folder){
            return res.sendStatus(404);
        }
        res.render('userFolder',{
            folder,
            errors: req.flash("errors"),
        });
    }catch(err){
        next(err);
    }
};
const renameFolder =[
    renameFolderValidation,
async(req,res,next)=>{


    try{

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            req.flash("errors", errors.array());
            return res.redirect('/');
        }

        const folder = await folderQueries.getFolderById(Number(req.params.id),req.user.id);

        if(!folder){
            return res.sendStatus(404);
        }

        const {newFolderName} = matchedData(req);

        await folderQueries.renameFolderById(folder.id, newFolderName);
        return res.redirect('/');

    }catch(err){
        next(err);
    }
}
];

const deleteFolder = async(req,res,next)=>{
    try{
        const folder = await folderQueries.getFolderById(Number(req.params.id),req.user.id);

        if(!folder){
            return res.sendStatus(404);
        }

        // delete all the files from supabase
        const files = await fileQueries.getAllFiles(req.user.id,folder.id);
        const paths = files.map(file => file.path);
        await storageServices.deleteFilesFromSupabase(paths);

        // delete the folder 
        await folderQueries.deleteFolderById(folder.id);
        return res.redirect('/');
    }catch(err){
        return next(err);
    }

};



module.exports = {
    getNewFolderForm,
    postNewFolderForm,
    getFolderById,
    renameFolder,
    deleteFolder,
}