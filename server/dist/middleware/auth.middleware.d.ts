import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
        phone: string | null;
        hospitalId?: string | null;
        providerId?: string | null;
    };
}
/**
 * Verifies the Bearer JWT and attaches user info to req.user
 */
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Role-based access guard – call after authenticate()
 */
export declare const authorize: (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map