const nodemailer = require('nodemailer');

const port = Number(process.env.EMAIL_PORT) || 587;
const sender = process.env.EMAIL_FROM || process.env.EMAIL_USER;

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    const mailOptions = {
        from: sender,
        to: userEmail,
        subject: `Booking Confirmed: ${eventTitle}`,
        html: `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for choosing Eventora.</p>
      `
    };
    await transporter.sendMail(mailOptions);
};

const sendOTPEmail = async (userEmail, otp, type) => {
    const title = type === 'account_verification' ? 'Verify your Eventora Account' : 'Eventora Booking Verification';
    const msg = type === 'account_verification'
        ? 'Please use the following OTP to verify your new Eventora account.'
        : 'Please use the following OTP to verify and confirm your event booking.';

    const mailOptions = {
        from: sender,
        to: userEmail,
        subject: title,
        html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #111;">${title}</h2>
                    <p style="color: #555; font-size: 16px;">${msg}</p>
                    <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `
    };
    await transporter.sendMail(mailOptions);
};

module.exports = { sendBookingEmail, sendOTPEmail };