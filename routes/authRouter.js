const {Router} = require('express');
const authController = require('../controllers/authController');

const authRouter = Router();


authRouter.get('/sign-up', authController.getSignUpForm);
authRouter.post('/sign-up', authController.postSignUpForm);

authRouter.get('/login', authController.getLogInForm);
authRouter.post('/login', authController.postLogInForm);

authRouter.get('/logout', authController.getLogOut);


module.exports = authRouter;