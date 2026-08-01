const{body, validationResult, matchedData} = require('express-validator');
const folderQueries = require('../db/folderQueries');

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
        const folder = await folderQueries.getFolderById(Number(req.params.id));
        res.render('userFolder',{
            folder,
        });
    }catch(err){
        next(err);
    }
};



module.exports = {
    getNewFolderForm,
    postNewFolderForm,
    getFolderById,
}