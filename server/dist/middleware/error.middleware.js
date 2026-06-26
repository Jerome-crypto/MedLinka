"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../config/logger");
const AppError_1 = require("../utils/AppError");
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    if (err instanceof AppError_1.AppError) {
        logger_1.logger.warn(`[${req.method}] ${req.path} → ${err.statusCode}: ${err.message}`);
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
        return;
    }
    // Prisma unique constraint violation
    if (err.code === 'P2002') {
        res.status(409).json({
            success: false,
            message: 'A record with this value already exists.',
        });
        return;
    }
    logger_1.logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map