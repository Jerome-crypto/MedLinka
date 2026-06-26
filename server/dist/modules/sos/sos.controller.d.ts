import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
export declare const SosController: {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    list(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    cancel(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    acknowledge(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createDirectTransport(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=sos.controller.d.ts.map