const {Router} = require('express');
const uploadController = require('../controllers/uploadController');
const upload = require('../lib/multer');
const {isAuthenticated} = require('../middleware/auth');

const uploadRouter = Router();

uploadRouter.get('/uploadFile', isAuthenticated, uploadController.getFileUpload);

uploadRouter.post('/uploadFile',isAuthenticated, (req,res,next)=>{
    upload.single('up_file')(req,res,(err)=>{

        if(err){
            return res.status(400).render('fileUpload',{
                folderId: req.query.folderId ?? null,
                error: err.message});
        }
        next();
    });
}, uploadController.postFileUpload);


module.exports = uploadRouter;