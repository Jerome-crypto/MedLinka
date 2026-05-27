import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { config } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';

// Route modules
import authRoutes from './modules/auth/auth.routes';
import sosRoutes from './modules/sos/sos.routes';
import ambulanceRoutes from './modules/ambulance/ambulance.routes';
import hospitalRoutes from './modules/hospital/hospital.routes';
import reportsRoutes from './modules/reports/reports.routes';
import providerRoutes from './modules/provider/provider.routes';

const app = express();

// Trust proxy (required for Railway / Render / Vercel deployment)
app.set('trust proxy', 1);

// ── Security Middleware ────────────────────────────────────────────
app.use(
  helmet({
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
  })
);

app.use(compression());
app.use(
  cors({
    origin:
      config.nodeEnv === 'production'
        ? [config.clientUrl]
        : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(requestLogger);

// ── Rate Limiters ──────────────────────────────────────────────────
// Only apply strict rate limits in production to avoid dev lockouts
const isProd = config.nodeEnv === 'production';

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 200 : 5000, // 5000 requests per 15 min in dev
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'unknown',
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

// Auth brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 15 : 1000, // 1000 auth attempts per 15 min in dev
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many auth attempts. Please wait 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// SOS high-throughput limiter — emergencies must not be blocked
app.use(
  '/api/sos',
  rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: 'SOS rate limit exceeded.' },
  })
);

// ── Health Check ───────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'MedLinka API',
    version: '1.0.0',
    env: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/providers', providerRoutes);

// ── 404 Handler ────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ───────────────────────────────────────────
app.use(errorHandler);

export default app;
