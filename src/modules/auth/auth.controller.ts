import type { CookieOptions, Request, Response } from "express";
import { env } from "../../config/environment.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AUTH_CONSTANTS, AUTH_MESSAGES } from "./auth.constants.js";
import { login as loginService } from "./auth.service.js";
import type { SessionContext } from "./auth.types.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { AppError } from "../../errors/app-error.js";
import type { LoginInput } from "./auth.validation.js";

function getRefreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,

    secure: env.NODE_ENV === "production",

    sameSite: "lax",

    path: AUTH_CONSTANTS.REFRESH_COOKIE_PATH,

    maxAge: env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  };
}

function getSessionContext(request: Request): SessionContext {
  const userAgent = request.get("user-agent");

  return {
    ...(request.ip !== undefined && {
      ipAddress: request.ip,
    }),

    ...(userAgent !== undefined && {
      userAgent,
    }),
  };
}

export async function login(request: Request, response: Response) {
  const input = request.body as LoginInput;

  const result = await loginService(input, getSessionContext(request));

  response.cookie(
    AUTH_CONSTANTS.REFRESH_COOKIE_NAME,
    result.refreshToken,
    getRefreshCookieOptions(),
  );

  return sendSuccess(response, {
    message: "Login successful.",

    data: {
      accessToken: result.accessToken,

      user: result.user,
    },
  });
}

export async function me(request: Request, response: Response) {
  if (request.user === undefined) {
    throw new AppError(
      AUTH_MESSAGES.AUTHENTICATION_REQUIRED,
      HTTP_STATUS.UNAUTHORIZED,
      "AUTHENTICATION_REQUIRED",
    );
  }

  const { databaseId: _databaseId, ...safeUser } = request.user;

  return sendSuccess(response, {
    message: "Authenticated user retrieved successfully.",

    data: {
      user: safeUser,
    },
  });
}
