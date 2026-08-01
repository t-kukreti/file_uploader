const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const userQueries = require('../db/userQueries');
const { verifyPassword } = require('../lib/passwordUtils');

const verifiedCallback = async (email, password, done) => {
    try{
        const user = await userQueries.findUserByEmail(email);
        
        if(!user){
            return done(null, false, {message: 'Incorrect email or password'});
        }
        
        const isValid = await verifyPassword(password, user.passwordHash);
        if(isValid){
            return done(null, user);
        } 
        else{
            return done(null, false, {message: 'Incorrect email or password'});
        }
    }catch(err){
        done(err);
    }
};

const strategy = new LocalStrategy({
    usernameField: 'email',
},
verifiedCallback
);
passport.use(strategy);

passport.serializeUser((user,done)=>{
    done(null, user.id);
});

passport.deserializeUser(async (id, done)=>{
    try{
        const user = await userQueries.findUserById(id);
        done(null,user);
    }catch(err){
        done(err);
    }
});

