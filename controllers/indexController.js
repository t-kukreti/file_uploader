const folderQueries = require('../db/folderQueries');
const fileQueries = require('../db/fileQueries');

const getIndexPage = async(req, res, next) => {
    try{
        let folders = [];
        let files = [];
        if(req.user){
            // you can run these parallely check it out later.
            folders = await folderQueries.getFoldersByOwner(req.user.id);
            files = await fileQueries.getAllFiles(req.user.id,null);
        }

        res.render('index',{
            folders,
            files,
            errors: req.flash("errors"),
        });
    }catch(err){
        next(err);
    }
}

module.exports = {
    getIndexPage,
}