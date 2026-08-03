const{body, validationResult, matchedData} = require('express-validator');
const folderQueries = require('../db/folderQueries');
const { folder } = require('../lib/prisma');
const fs = require('fs/promises');
const validatePostForm = [
    body('folderName').trim().notEmpty().withMessage('Folder name is required').isLength({max: 100}).withMessage('Folder name is too long')
];

const getNewFolderForm = (req,res)=>{
    res.render('newFolder', {errors: []});
};

const postNewFolderForm = [
    validatePostForm,
    async(req, res, next)=>{
        const errors  = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).render('newFolder',{errors: errors.array()});
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

const getFolderById = async(req,res)=>{
    try{
        const folder = await folderQueries.getFolderById(Number(req.params.id),req.user.id);
        if(!folder){
            return res.sendStatus(404);
        }
        res.render('userFolder',{
            folder,
        });
    }catch(err){
        next(err);
    }
};
const renameFolder = async(req,res,next)=>{
    try{
        const folder = await folderQueries.getFolderById(Number(req.params.id),req.user.id);

        if(!folder){
            return res.sendStatus(404);
        }

        await folderQueries.renameFolderById(folder.id,req.body.newFolderName);
        return res.redirect('/');

    }catch(err){
        next(err);
    }
};

const deleteFolder = async(req,res,next)=>{
    try{
        const folder = await folderQueries.getFolderById(Number(req.params.id),req.user.id);

        if(!folder){
            return res.sendStatus(404);
        }

        await Promise.all(folder.files.map(file => fs.unlink(file.path)));
        // for (const file of folder.files){
            // await fs.unlink(file.path);
        // }

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