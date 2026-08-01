const {body, validationResult, matchedData} = require('express-validator');
const userQueries = require('../db/userQueries');
const passwordUtils = require('../lib/passwordUtils');
const passport = require('passport');




const postSignUpValidation = [
    body('email').isEmail().withMessage(`email must be formatted correctly`),
    body('password').isStrongPassword().withMessage(`create a more strong password`),

    body('confirm_password').custom((value, {req})=>{
        return value === req.body.password;
    }).withMessage(`password do not match`),

    body('email').custom(async(value)=>{
        const user = await userQueries.findUserByEmail(value);
        if(user){
            throw new Error('email already in use');
        }
        return true;
    }),

];


const validateLogIn = [
    body("email").isEmail().withMessage(`$email must be formatted correctly`),
    body("password").notEmpty().withMessage(`password is empty`),
];




const getSignUpForm = (req,res) => {
    res.render('signUp', {
        errors: [],
    });
};

const postSignUpForm = [
    postSignUpValidation,
    async(req, res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            console.log(errors.array());
            return res.status(400).render('signUp',{ errors: errors.array(),});  
        }
        try{
            const {email, password} = matchedData(req);
            const hashedPassword = await passwordUtils.hashPassword(password);
            await userQueries.addUser(email,hashedPassword);

            res.redirect('/auth/login');

        }catch(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }

    }
];

const getLogInForm = (req, res) => {
    res.render('login', {
        errors: [],
    });
}

const postLogInForm = [
    validateLogIn,
    async(req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).render('login', {errors: errors.array()});
        }
        return next();

    },

    (req,res,next)=>{

        passport.authenticate('local',(err, user, info) => {
            if(err){
                return next(err);
            }
            if(!user){
                return res.status(401).render('login', {errors: [{msg: info.message}]});
            }
            req.logIn(user, (err)=>{
                if(err) return next(err);
                return res.redirect('/');
            });
        })(req, res, next)
    }   
];

const getLogOut = (req, res, next) => {
    req.logout((err)=>{
        if(err){
            return next(err);
        }

        res.redirect('/auth/sign-up');
    });
};


module.exports = {
    getSignUpForm,
    postSignUpForm,
    getLogInForm,
    postLogInForm,
    getLogOut,
}