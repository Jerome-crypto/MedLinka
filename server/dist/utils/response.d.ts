import { Response } from 'express';
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => void;
export declare const sendCreated: <T>(res: Response, data: T, message?: string) => void;
export declare const sendNoContent: (res: Response) => void;
//# sourceMappingURL=response.d.ts.map