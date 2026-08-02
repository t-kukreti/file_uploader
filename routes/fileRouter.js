const {Router} = require('express');
const {isAuthenticated} = require('../middleware/auth');
const fileController = require('../controllers/fileController');
const { isObjectEnumValue } = require('@prisma/client/runtime/client');

const fileRouter = Router();

fileRouter.get('/:id/download', isAuthenticated, fileController.downloadFile);

fileRouter.post('/:id/delete', isAuthenticated, fileController.deleteFile);
fileRouter.post('/:id/rename', isAuthenticated, fileController.renameFile);


module.exports = fileRouter;