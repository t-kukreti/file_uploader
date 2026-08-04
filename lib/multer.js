const multer = require('multer');

const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "text/plain",
    "application/octet-stream",

];

const upload = multer({

    dest: './uploads/',

    limits: {
        fileSize: 10 * 1024 * 1024,
    },

    fileFilter(req,file,cb){
       if(allowedTypes.includes(file.mimetype)){
        return cb(null,true);
       } 
       else{
        return cb(new Error("only PDFs, jpeg, text and png are allowed"));
       }
    }
});


module.exports = upload;
