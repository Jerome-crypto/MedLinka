import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

/**
 * Zod request body validator — use instead of express-validator where schemas are complex.
 * Usage: router.post('/', zodValidate(MySchema), controller)
 */
export const zodValidate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new AppError(messages, 422));
      } else {
        next(err);
      }
    }
  };
