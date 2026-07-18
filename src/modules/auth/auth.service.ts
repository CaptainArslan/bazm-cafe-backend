import bcrypt from "bcrypt";
import { env } from "../../config/environment.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { AppError } from "../../errors/app-error.js";
import { AUTH_CONSTANTS, AUTH_MESSAGES } from "./auth.constants.js";

import {
  createRefreshToken,
  findAuthenticatedUserById,
  findUserForLogin,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "./auth.repository.js";

import {
  generateOpaqueToken,
  hashOpaqueToken,
  signAccessToken,
} from "./token.service.js";

import type {
  AuthenticatedUser,
  LoginResult,
  SessionContext,
} from "./auth.types.js";

import type { LoginInput } from "./auth.validation.js";

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export async function login(
  input: LoginInput,
  sessionContext: SessionContext,
): Promise<LoginResult> {
  const user = await findUserForLogin(input.email);

  if (user === null) {
    throw new AppError(
      AUTH_MESSAGES.INVALID_CREDENTIALS,
      HTTP_STATUS.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
    );
  }

  if (!user.isActive || user.deletedAt !== null) {
    throw new AppError(
      AUTH_MESSAGES.ACCOUNT_UNAVAILABLE,
      HTTP_STATUS.UNAUTHORIZED,
      "ACCOUNT_UNAVAILABLE",
    );
  }

  const now = new Date();

  if (user.lockedUntil !== null && user.lockedUntil > now) {
    throw new AppError(
      AUTH_MESSAGES.ACCOUNT_LOCKED,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      "ACCOUNT_LOCKED",
    );
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;

    const shouldLockAccount =
      failedLoginAttempts >= AUTH_CONSTANTS.MAX_FAILED_LOGIN_ATTEMPTS;

    await recordFailedLogin(
      user.id,

      shouldLockAccount ? 0 : failedLoginAttempts,

      shouldLockAccount
        ? addMinutes(now, AUTH_CONSTANTS.ACCOUNT_LOCK_MINUTES)
        : null,
    );

    throw new AppError(
      AUTH_MESSAGES.INVALID_CREDENTIALS,
      HTTP_STATUS.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
    );
  }

  const refreshToken = generateOpaqueToken();

  await createRefreshToken({
    userId: user.id,

    tokenHash: hashOpaqueToken(refreshToken),

    expiresAt: addDays(now, env.JWT_REFRESH_EXPIRES_DAYS),

    ...(input.deviceName !== undefined && {
      deviceName: input.deviceName,
    }),

    ...(sessionContext.ipAddress !== undefined && {
      ipAddress: sessionContext.ipAddress,
    }),

    ...(sessionContext.userAgent !== undefined && {
      userAgent: sessionContext.userAgent,
    }),
  });

  await recordSuccessfulLogin(user.id);

  const accessToken = signAccessToken({
    sub: user.id.toString(),
    role: user.role,
  });

  return {
    accessToken,
    refreshToken,

    user: {
      id: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getCurrentUser(
  userId: bigint,
): Promise<AuthenticatedUser> {
  const user = await findAuthenticatedUserById(userId);

  if (user === null) {
    throw new AppError(
      AUTH_MESSAGES.AUTHENTICATION_REQUIRED,
      HTTP_STATUS.UNAUTHORIZED,
      "USER_NOT_FOUND",
    );
  }

  if (!user.isActive || user.deletedAt !== null) {
    throw new AppError(
      AUTH_MESSAGES.ACCOUNT_UNAVAILABLE,
      HTTP_STATUS.UNAUTHORIZED,
      "ACCOUNT_UNAVAILABLE",
    );
  }

  return {
    databaseId: user.id,
    id: user.uuid,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
