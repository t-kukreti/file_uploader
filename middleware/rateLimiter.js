const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "too many requests. Please try again in 15 minutes",
    },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === 'production' ? 5 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "too many login attempts. Please try again in 15 minutes",
    },
});

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message:{
        error: "too many upload attempts. Please try again in 15 minutes",
    },
});

module.exports = {
    generalLimiter,
    authLimiter,
    uploadLimiter
};