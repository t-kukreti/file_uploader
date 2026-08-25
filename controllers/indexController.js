const folderQueries = require('../db/folderQueries');
const fileQueries = require('../db/fileQueries');
const uploadQueries = require('../db/uploadQueries');

const getIndexPage = async(req, res, next) => {
    try{
        let folders = [];
        let files = [];
        let incompleteUploads = [];

        if(req.user){
            // you can run these parallely check it out later.
            folders = await folderQueries.getFoldersByOwner(req.user.id);
            files = await fileQueries.getAllFiles(req.user.id, null);
            incompleteUploads = await uploadQueries.getIncompleteUploads(req.user.id);
        }

        res.render('index',{
            folders,
            files,
            incompleteUploads,
            errors: req.flash("errors"),
        });
    }catch(err){
        next(err);
    }
}


module.exports = {
    getIndexPage,
}