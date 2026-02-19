const { Resend } = require('resend');
const otpTemplate = require('./templates/otpTemplate');

const resend = new Resend(process.env.RESEND_KEY);

/**
 * Send OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 */
exports.sendOtpEmail = async (email, otp) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'CopyTradeHome <support@copytradehome.com>',
            to: [email],
            subject: 'Verify Your Email - CopyTradeHome',
            html: otpTemplate(otp),
        });

        if (error) {
            console.error('Resend Error:', error);
            throw new Error('Failed to send email');
        }

        console.log('Email sent successfully:', data.id);
        return data;
    } catch (err) {
        console.error('Email Service Error:', err.message);
        throw err;
    }
};
