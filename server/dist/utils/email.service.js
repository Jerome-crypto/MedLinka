"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
// Create a transporter using nodemailer
const transporter = nodemailer_1.default.createTransport({
    host: env_1.config.smtp.host,
    port: env_1.config.smtp.port,
    secure: env_1.config.smtp.port === 465, // true for 465, false for other ports
    auth: {
        user: env_1.config.smtp.user,
        pass: env_1.config.smtp.pass,
    },
});
exports.EmailService = {
    /** Send account verification OTP email */
    async sendVerificationEmail(email, otp) {
        if (!env_1.config.smtp.user || !env_1.config.smtp.pass) {
            logger_1.logger.warn(`[Email Service] No credentials configured. Simulated OTP for ${email}: ${otp}`);
            return;
        }
        try {
            const info = await transporter.sendMail({
                from: `"MedLinka ER" <${env_1.config.smtp.user}>`,
                to: email,
                subject: 'MedLinka - Verify Your Account',
                text: `Welcome to MedLinka! Your verification OTP code is: ${otp}. It will expire in 10 minutes.`,
                html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #00897B; margin-top: 0;">Welcome to MedLinka!</h2>
            <p>Please verify your account using the verification code below:</p>
            <div style="background: #F5F5F5; font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 15px 20px; text-align: center; border-radius: 6px; margin: 20px 0; color: #1565C0;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #777;">This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `,
            });
            logger_1.logger.info(`[Email Service] Verification email sent to ${email} (MessageId: ${info.messageId})`);
        }
        catch (error) {
            logger_1.logger.error(`[Email Service] Failed to send verification email to ${email}:`, error);
            throw new Error('Could not send verification email. Please try again.');
        }
    },
    /** Send password recovery OTP email */
    async sendPasswordResetEmail(email, otp) {
        if (!env_1.config.smtp.user || !env_1.config.smtp.pass) {
            logger_1.logger.warn(`[Email Service] No credentials configured. Simulated Reset OTP for ${email}: ${otp}`);
            return;
        }
        try {
            const info = await transporter.sendMail({
                from: `"MedLinka ER" <${env_1.config.smtp.user}>`,
                to: email,
                subject: 'MedLinka - Password Reset Request',
                text: `You requested a password reset. Your OTP code is: ${otp}. It will expire in 10 minutes.`,
                html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #D32F2F; margin-top: 0;">Password Reset Request</h2>
            <p>You requested a password reset. Please use the code below to set a new password:</p>
            <div style="background: #F5F5F5; font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 15px 20px; text-align: center; border-radius: 6px; margin: 20px 0; color: #D32F2F;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #777;">This code is valid for 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
          </div>
        `,
            });
            logger_1.logger.info(`[Email Service] Password reset email sent to ${email} (MessageId: ${info.messageId})`);
        }
        catch (error) {
            logger_1.logger.error(`[Email Service] Failed to send password reset email to ${email}:`, error);
            throw new Error('Could not send password reset email. Please try again.');
        }
    },
};
//# sourceMappingURL=email.service.js.map