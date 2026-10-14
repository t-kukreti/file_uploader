const {Router} = require('express');
const authController = require('../controllers/authController');

const authRouter = Router();


authRouter.get('/sign-up', authController.getSignUpForm);
authRouter.post('/sign-up', authController.postSignUpForm);

authRouter.get('/login', authController.getLogInForm);
authRouter.post('/login', authController.postLogInForm);

authRouter.get('/logout', authController.getLogOut);

authRouter.get('/verifyEmail', authController.getVerifyEmailPage);
authRouter.get('/verifyEmail/confirm', authController.confirmEmail);

authRouter.get('/reVerifyEmail', authController.reVerifyEmail);

authRouter.get('/forgot-password', authController.getForgotPasswordPage);
authRouter.post('/forgot-password', authController.postForgotPasswordPage);
authRouter.get('/forgot-password/confirm', authController.verifyForgotPasswordRequest);

authRouter.post('/change-password', authController.postChangePasswordPage);
module.exports = authRouter;
