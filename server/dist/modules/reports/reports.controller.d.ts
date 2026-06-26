import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
export declare const ReportsController: {
    stats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    responseTime(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    requestsPerDay(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    requestsPerWeek(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    analytics(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    activityFeed(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    ambulanceUtilisation(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    recentRequests(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    exportCSV(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=reports.controller.d.ts.map