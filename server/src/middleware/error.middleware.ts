import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn(`[${req.method}] ${req.path} → ${err.statusCode}: ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Prisma unique constraint violation
  if ((err as any).code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
    });
    return;
  }

  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
