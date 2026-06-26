/**
 * Custom operational error with HTTP status code
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, statusCode: number);
}
//# sourceMappingURL=AppError.d.ts.map