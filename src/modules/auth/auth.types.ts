import type { UserRole } from '../../generated/prisma/enums.js';

export type AccessTokenClaims = {
    sub: string;
    role: UserRole;
};

export type AuthenticatedUser = {
    databaseId: bigint;
    id: string;
    name: string;
    email: string;
    role: UserRole;
};

export type SafeUser = Omit<AuthenticatedUser, 'databaseId'>;

export type SessionContext = {
    ipAddress?: string;
    userAgent?: string;
    deviceName?: string;
};

export type LoginResult = {
    accessToken: string;
    refreshToken: string;
    user: SafeUser;
};

export type RefreshResult = LoginResult;

export type PasswordResetRequestResult = {
    resetToken?: string;
};