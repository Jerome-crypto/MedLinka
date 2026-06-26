import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
export declare const AmbulanceController: {
    list(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateLocation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateMyStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    assignDriver(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=ambulance.controller.d.ts.map