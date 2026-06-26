"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_1 = require("../../utils/response");
exports.AuthController = {
    async register(req, res, next) {
        try {
            (0, response_1.sendCreated)(res, await auth_service_1.AuthService.register(req.body), 'Registration successful');
        }
        catch (err) {
            next(err);
        }
    },
    async login(req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await auth_service_1.AuthService.login(req.body), 'Login successful');
        }
        catch (err) {
            next(err);
        }
    },
    async refresh(req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await auth_service_1.AuthService.refresh(req.body.refreshToken), 'Token refreshed');
        }
        catch (err) {
            next(err);
        }
    },
    async me(req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await auth_service_1.AuthService.getMe(req.user.id));
        }
        catch (err) {
            next(err);
        }
    },
    async logout(req, res, next) {
        try {
            await auth_service_1.AuthService.logout(req.user.id);
            (0, response_1.sendSuccess)(res, null, 'Logged out successfully');
        }
        catch (err) {
            next(err);
        }
    },
    async forgotPassword(req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await auth_service_1.AuthService.forgotPassword(req.body.email));
        }
        catch (err) {
            next(err);
        }
    },
    async verifyOtp(req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await auth_service_1.AuthService.verifyOtp(req.body.email, req.body.otp));
        }
        catch (err) {
            next(err);
        }
    },
    async resetPassword(req, res, next) {
        try {
            const { email, otp, newPassword } = req.body;
            (0, response_1.sendSuccess)(res, await auth_service_1.AuthService.resetPassword(email, otp, newPassword));
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map