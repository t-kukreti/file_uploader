const { validationResult, matchedData } = require('express-validator');
const { generateToken, hashToken, verifyToken } = require('../lib/tokenUtils');
const { sendVerificationMail } = require('../services/emailService');
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

            const emailToken = generateToken();
            const tokenExpiry = new Date();
            tokenExpiry.setHours(tokenExpiry.getHours() + 1);

            const tokenHash = await hashToken(emailToken);

            const user = await userQueries.addUser(email, hashedPassword, tokenExpiry, tokenHash);

            await sendVerificationMail(email, emailToken, user.id);
            
            res.redirect('/auth/verifyEmail');

        }catch(err){

            res.status(500).send('Internal Server Error');
        }

    }
];

const getLogInForm = (req, res) => {
    res.render('login', {
        errors: req.flash("errors"),
        userId: req.query.userId || null,
        unverified: req.query.unverified === 'true',
    });
};

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
                if(info.message === "Please verify your email before logging in."){
                    return res.redirect(`/auth/login?userId=${info.userId}&unverified=true`);
                }
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

const getVerifyEmailPage = (req, res) => {
    res.render('verifyEmail', {
        errors: req.flash("errors"),
    });
};

const confirmEmail = async(req, res, next) => {
    try{
        const { userId, token } = req.query;
        const user = await userQueries.findUserById(Number(userId));

        if(!user) return res.status(400).send("Invalid verification link");

         if (!user.tokenHash || !user.tokenExpiry) {
            return res.status(400).send("Invalid verification link");
        }

        if (new Date() > user.tokenExpiry) {
            return res.status(400).send("Verification link expired");
        }

        const valid = await verifyToken(token, user.tokenHash);

        if(!valid){
            return res.status(400).send("Invalid verification link");
        }

        await userQueries.verifyEmail(Number(userId));

        return res.redirect('/auth/login');

    }catch(err){
        return next(err);
    }
};

const reVerifyEmail = async(req, res, next) => {
    try{
        const { userId } = req.query;
        const user = await userQueries.findUserById(Number(userId));

        if(!user) return res.redirect('/auth/sign-up');
        if(user.emailVerified) return res.redirect('/auth/login');

        const emailToken = generateToken();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 1);
        const tokenHash = await hashToken(emailToken);

        await userQueries.updateTokenById(user.id, tokenExpiry, tokenHash);

        await sendVerificationMail(user.email, emailToken, user.id);

        return res.redirect('/auth/verifyEmail');
    }catch(err){
        return next(err);
    }
};


module.exports = {
    getSignUpForm,
    postSignUpForm,
    getLogInForm,
    postLogInForm,
    getLogOut,
    getVerifyEmailPage,
    confirmEmail,
    reVerifyEmail,
}