const userQueries = require('../db/userQueries');
const {body} = require('express-validator');
const postSignUpValidation = [
    body('email').isEmail().withMessage(`Email must be formatted correctly`),
    body('password').isStrongPassword().withMessage(`create a stronger password`),

    body('confirm_password').custom((value, {req})=>{
        return value === req.body.password;
    }).withMessage(`password do not match`),

    body('email').custom(async(value)=>{
        const user = await userQueries.findUserByEmail(value);
        if(user){
            throw new Error('Email already in use');
        }
        return true;
    }),

];

const validateLogIn = [
    body("email").isEmail().withMessage(`Email must be formatted correctly`),
    body("password").notEmpty().withMessage(`password is empty`),
];

module.exports = {
    postSignUpValidation,
    validateLogIn,
}