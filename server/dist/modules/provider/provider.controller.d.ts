import { Request, Response, NextFunction } from 'express';
export declare const ProviderController: {
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyFleet(req: Request, res: Response, next: NextFunction): Promise<void>;
    createManager(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyDrivers(req: Request, res: Response, next: NextFunction): Promise<void>;
    createDriver(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=provider.controller.d.ts.map