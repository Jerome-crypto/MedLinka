import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Zod request body validator — use instead of express-validator where schemas are complex.
 * Usage: router.post('/', zodValidate(MySchema), controller)
 */
export declare const zodValidate: (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=zodValidate.middleware.d.ts.map