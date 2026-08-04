const {body} = require('express-validator');

const nameValidation = (field)=>{
    return body(field)
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty.")
        .isLength({ max: 255 })
        .withMessage("Name is too long.")
        .matches(/^[^<>:"/\\|?*]+$/)
        .withMessage("Name contains invalid characters.")
        .custom(value => {
    if (/^\.+$/.test(value)) {
        throw new Error("Name cannot consist only of dots.");
    }
    return true;
})
};

const createFolderValidation = [
    nameValidation('folderName'),
];

const renameFolderValidation = [
    nameValidation('newFolderName'),
];

const renameFileValidation = [
    nameValidation('newFileName'),
];

module.exports = {
    createFolderValidation,
    renameFolderValidation,
    renameFileValidation,
}

