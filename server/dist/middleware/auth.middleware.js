"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const database_1 = require("../config/database");
const AppError_1 = require("../utils/AppError");
/**
 * Verifies the Bearer JWT and attaches user info to req.user
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError_1.AppError('No token provided', 401);
        }
        const token = authHeader.split(' ')[1];
        const payload = jsonwebtoken_1.default.verify(token, env_1.config.jwt.secret);
        // Verify user still exists and is active
        const user = await database_1.prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, role: true, phone: true, isActive: true },
        });
        if (!user || !user.isActive) {
            throw new AppError_1.AppError('User not found or deactivated', 401);
        }
        req.user = {
            id: user.id,
            role: user.role,
            phone: user.phone,
            hospitalId: payload.hospitalId,
            providerId: payload.providerId,
        };
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new AppError_1.AppError('Invalid or expired token', 401));
        }
        else {
            next(err);
        }
    }
};
exports.authenticate = authenticate;
/**
 * Role-based access guard – call after authenticate()
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            next(new AppError_1.AppError('Access forbidden: insufficient privileges', 403));
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map