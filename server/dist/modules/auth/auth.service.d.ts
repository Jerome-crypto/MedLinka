import { Role } from '@prisma/client';
interface RegisterDto {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role?: Role;
    providerId?: string;
    hospitalId?: string;
}
interface LoginDto {
    email: string;
    password: string;
}
export declare const AuthService: {
    register(dto: RegisterDto): Promise<{
        user: {
            name: string;
            id: string;
            phone: string | null;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            providerId: string | null;
            hospitalId: string | null;
            createdAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            name: string;
            phone: string | null;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            hospitalId: string | null;
            providerId: string | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getMe(userId: string): Promise<{
        name: string;
        id: string;
        phone: string | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        providerId: string | null;
        hospitalId: string | null;
        createdAt: Date;
    }>;
    logout(userId: string): Promise<void>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    verifyOtp(email: string, otp: string): Promise<{
        valid: boolean;
    }>;
    resetPassword(email: string, otp: string, newPassword: string): Promise<{
        message: string;
    }>;
};
export {};
//# sourceMappingURL=auth.service.d.ts.map