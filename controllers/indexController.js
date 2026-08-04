const folderQueries = require('../db/folderQueries');
const fileQueries = require('../db/fileQueries');
const upload = require('../lib/multer');

const getIndexPage = async(req, res, next) => {
    try{
        let folders = [];
        let files = [];
        if(req.user){
            // you can run these parallely check it out later.
            folders = await folderQueries.getFoldersByOwner(req.user.id);
            files = await fileQueries.getAllFiles(req.user.id);
        }

        res.render('index',{
            folders,
            files
        });
    }catch(err){
        next(err);
    }
}

module.exports = {
    getIndexPage,
}