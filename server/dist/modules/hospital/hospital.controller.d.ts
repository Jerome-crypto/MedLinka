import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
export declare const HospitalController: {
    list(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    incoming(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    mine(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMyDrivers(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createMyDriver(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMyAmbulances(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createMyAmbulance(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    assignMyDriver(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=hospital.controller.d.ts.map