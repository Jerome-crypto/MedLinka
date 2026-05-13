import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * HTTP request logger — logs method, path, status, and duration in ms
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = res.statusCode >= 500 ? '31' : res.statusCode >= 400 ? '33' : '32';
    logger.debug(
      `\x1b[${color}m${req.method}\x1b[0m ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};
