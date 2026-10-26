const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    action: { type: String, required: true },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 10 * 60 * 1000),
        expires: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpSchema);
