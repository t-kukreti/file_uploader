const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_KEY);

module.exports = resend;
