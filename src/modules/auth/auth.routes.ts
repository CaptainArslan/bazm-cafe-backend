import { Router } from "express";
import { authenticationRateLimiter } from "../../middleware/rate-limit.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { login, me } from "./auth.controller.js";
import { loginSchema } from "./auth.validation.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  authenticationRateLimiter,
  validate(loginSchema),
  asyncHandler(login),
);

authRouter.get("/me", authenticate, asyncHandler(me));
