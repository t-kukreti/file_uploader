const {Router} = require('express');
const folderController = require('../controllers/folderController');
const {isAuthenticated} = require('../middleware/auth');

const folderRouter = Router();

folderRouter.get('/new', isAuthenticated, folderController.getNewFolderForm);
folderRouter.post('/', isAuthenticated, folderController.postNewFolderForm);

folderRouter.get('/:id', isAuthenticated, folderController.getFolderById);

folderRouter.post('/:id/rename',isAuthenticated, folderController.renameFolder);
folderRouter.post('/:id/delete', isAuthenticated, folderController.deleteFolder);

module.exports = folderRouter;