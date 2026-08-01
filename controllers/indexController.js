const folderQueries = require('../db/folderQueries');
const uploadQueries = require('../db/uploadQueries');
const upload = require('../lib/multer');

const getIndexPage = async(req, res, next) => {
    try{
        let folders = [];
        let files = [];
        if(req.user){
            // you can run these parallely check it out later.
            folders = await folderQueries.getFoldersByOwner(req.user.id);
            files = await uploadQueries.getRootFiles(req.user.id);
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