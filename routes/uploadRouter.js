const {Router} = require('express');
const uploadController = require('../controllers/uploadController');
const upload = require('../lib/multer');
const {isAuthenticated} = require('../middleware/auth');

const uploadRouter = Router();

uploadRouter.get('/uploadFile', isAuthenticated, uploadController.getFileUpload);

uploadRouter.post('/uploadFile',isAuthenticated, upload.single('up_file'), uploadController.postFileUpload);


module.exports = uploadRouter;