"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
const logger_middleware_1 = require("./middleware/logger.middleware");
// Route modules
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const sos_routes_1 = __importDefault(require("./modules/sos/sos.routes"));
const ambulance_routes_1 = __importDefault(require("./modules/ambulance/ambulance.routes"));
const hospital_routes_1 = __importDefault(require("./modules/hospital/hospital.routes"));
const reports_routes_1 = __importDefault(require("./modules/reports/reports.routes"));
const provider_routes_1 = __importDefault(require("./modules/provider/provider.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const app = (0, express_1.default)();
// Trust proxy (required for Railway / Render / Vercel deployment)
app.set('trust proxy', 1);
// ── Security Middleware ────────────────────────────────────────────
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https://*.tile.openstreetmap.org', 'https://unpkg.com'],
            connectSrc: ["'self'", 'ws://localhost:5000', 'wss:'],
            scriptSrc: ["'self'"],
        },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.config.nodeEnv === 'production'
        ? [env_1.config.clientUrl]
        : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
app.use((0, morgan_1.default)(env_1.config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(logger_middleware_1.requestLogger);
// ── Rate Limiters ──────────────────────────────────────────────────
// Only apply strict rate limits in production to avoid dev lockouts
const isProd = env_1.config.nodeEnv === 'production';
app.use('/api', (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 200 : 5000, // 5000 requests per 15 min in dev
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'unknown',
    message: { success: false, message: 'Too many requests, please try again later.' },
}));
// Auth brute-force protection
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 15 : 1000, // 1000 auth attempts per 15 min in dev
    skipSuccessfulRequests: true,
    message: { success: false, message: 'Too many auth attempts. Please wait 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
// SOS high-throughput limiter — emergencies must not be blocked
app.use('/api/sos', (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: 'SOS rate limit exceeded.' },
}));
// ── Health Check ───────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'MedLinka API',
        version: '1.0.0',
        env: env_1.config.nodeEnv,
        timestamp: new Date().toISOString(),
    });
});
// ── API Routes ─────────────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/sos', sos_routes_1.default);
app.use('/api/ambulances', ambulance_routes_1.default);
app.use('/api/hospitals', hospital_routes_1.default);
app.use('/api/reports', reports_routes_1.default);
app.use('/api/providers', provider_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// ── 404 Handler ────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
// ── Global Error Handler ───────────────────────────────────────────
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map