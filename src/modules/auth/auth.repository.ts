import { prisma } from "../../config/database.js";

export function findUserForLogin(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },

    select: {
      id: true,
      uuid: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      isActive: true,
      deletedAt: true,
      failedLoginAttempts: true,
      lockedUntil: true,
    },
  });
}

export function recordFailedLogin(
  userId: bigint,
  failedLoginAttempts: number,
  lockedUntil: Date | null,
) {
  return prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      failedLoginAttempts,
      lockedUntil,
    },

    select: {
      id: true,
    },
  });
}

export function recordSuccessfulLogin(userId: bigint) {
  return prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },

    select: {
      id: true,
    },
  });
}

type CreateRefreshTokenData = {
  userId: bigint;
  tokenHash: string;
  expiresAt: Date;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
};

export function createRefreshToken(data: CreateRefreshTokenData) {
  return prisma.refreshToken.create({
    data,

    select: {
      id: true,
    },
  });
}

export function findAuthenticatedUserById(userId: bigint) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      uuid: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      deletedAt: true,
    },
  });
}
