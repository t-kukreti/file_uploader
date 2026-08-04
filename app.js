require('dotenv').config();
require('./config/passport');
const express = require('express');
const session = require('express-session');
const prisma = require('./lib/prisma');
const {PrismaSessionStore} = require('@quixo3/prisma-session-store');
const passport = require('passport');

const PORT = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

app.set('view engine', 'ejs');



app.use(session({
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000 
    },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
        prisma,
        {
            checkPeriod: 2 * 60 * 1000,
            dbRecordIdIsSessionId: true,
        }
    )
})
);


app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next)=>{
    res.locals.currentUser = req.user || null;
    next();
});



const indexRouter = require('./routes/indexRouter');
const authRouter = require('./routes/authRouter');
const uploadRouter = require('./routes/uploadRouter');
const folderRouter = require('./routes/folderRouter');
const fileRouter = require('./routes/fileRouter');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/uploads', uploadRouter);
app.use('/folders', folderRouter);
app.use('/files',fileRouter);




app.listen(PORT, (err)=>{
    if(err) throw err;
    console.log(`running on port ${PORT}`);
});




