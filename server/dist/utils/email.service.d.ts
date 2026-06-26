export declare const EmailService: {
    /** Send account verification OTP email */
    sendVerificationEmail(email: string, otp: string): Promise<void>;
    /** Send password recovery OTP email */
    sendPasswordResetEmail(email: string, otp: string): Promise<void>;
};
//# sourceMappingURL=email.service.d.ts.map