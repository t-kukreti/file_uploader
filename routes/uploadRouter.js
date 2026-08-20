const {Router} = require('express');
const uploadController = require('../controllers/uploadController');
const upload = require('../lib/multer');
const {isAuthenticated} = require('../middleware/auth');

const uploadRouter = Router();

uploadRouter.get('/uploadFile', isAuthenticated, uploadController.getFileUpload);

uploadRouter.post('/uploadFile',isAuthenticated, uploadController.postFileUpload);

uploadRouter.post('/:uploadSessionId/parts/:partNumber', isAuthenticated, uploadController.getPartUploadUrl);

uploadRouter.put('/:uploadSessionId/parts/:partNumber', isAuthenticated, uploadController.savePart);



uploadRouter.post('/:uploadSessionId/complete', isAuthenticated, uploadController.completeUpload);

module.exports = uploadRouter;