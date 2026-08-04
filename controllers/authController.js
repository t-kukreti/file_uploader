const {body, validationResult, matchedData} = require('express-validator');
const userQueries = require('../db/userQueries');
const passwordUtils = require('../lib/passwordUtils');
const passport = require('passport');

const authValidator = require('../validators/authValidators');

const getSignUpForm = (req,res) => {
    res.render('signUp', {
        errors: req.flash("errors"),
    });
};

const postSignUpForm = [
    authValidator.postSignUpValidation,
    async(req, res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            req.flash("errors", errors.array());
            return res.redirect('/auth/sign-up'); 
        }
        try{
            const {email, password} = matchedData(req);
            const hashedPassword = await passwordUtils.hashPassword(password);
            await userQueries.addUser(email,hashedPassword);

            res.redirect('/auth/login');

        }catch(err){

            res.status(500).send('Internal Server Error');
        }

    }
];

const getLogInForm = (req, res) => {
    res.render('login', {
        errors: req.flash("errors"),
    });
}

const postLogInForm = [
    authValidator.validateLogIn,
    async(req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            req.flash("errors", errors.array());
            return res.redirect('/auth/login');
        }
        return next();

    },

    (req,res,next)=>{

        passport.authenticate('local',(err, user, info) => {
            if(err){
                return next(err);
            }
            if(!user){
                req.flash("errors", [{msg: info.message}]);
                return res.redirect('/auth/login');
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

        res.redirect('/');
    });
};


module.exports = {
    getSignUpForm,
    postSignUpForm,
    getLogInForm,
    postLogInForm,
    getLogOut,
}