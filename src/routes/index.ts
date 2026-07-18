import { Router } from "express";
import { authRouter } from "../modules/auth/index.js";
import { sendSuccess } from "../utils/api-response.js";

export const apiRouter = Router();

apiRouter.get("/", (_request, response) => {
  return sendSuccess(response, {
    message: "BAZM Cafe API v1 is available.",

    data: {
      version: "1.0.0",
    },
  });
});

apiRouter.use("/auth", authRouter);
