"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../config/logger");
/**
 * HTTP request logger — logs method, path, status, and duration in ms
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const color = res.statusCode >= 500 ? '31' : res.statusCode >= 400 ? '33' : '32';
        logger_1.logger.debug(`\x1b[${color}m${req.method}\x1b[0m ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=logger.middleware.js.map