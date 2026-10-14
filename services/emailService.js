const resend = require('../lib/resend');

const sendVerificationMail = async (email, token, userId) => {
    const verificationLink = `${process.env.APP_URL}/auth/verifyEmail/confirm?userId=${userId}&token=${token}`;
    await resend.emails.send({
        from: 'FileUploader <no-reply@notifications.fileuploader.in>',
        to: email,
        subject: 'Verify your email',
        html: `
                <h1>Verify your email</h1>
                <p>Click the link below to verify your account:</p>
                <a href="${verificationLink}">
                    Verify Email
                </a>
            `
    });
};


const sendForgottenPasswordMail = async (email, token, userId) => {
    const passwordResetLink = `${process.env.APP_URL}/auth/forgot-password/confirm?userId=${userId}&passwordResetToken=${token}`;
    await resend.emails.send({
        from: 'FileUploader <no-reply@notifications.fileuploader.in>',
        to: email,
        subject: 'Reset your password',
        html: `
                <h1>Reset your Password</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${passwordResetLink}">
                    Reset your Password
                </a>
            `
    });
};
module.exports = {
    sendVerificationMail,
    sendForgottenPasswordMail,
}
