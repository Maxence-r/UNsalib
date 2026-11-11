import express from "express";

import { loginValidator } from "../validators/auth.validator.js";
import { withAuthenticated } from "../middlewares/auth.middleware.js";
import { withValidated } from "../middlewares/validation.middleware.js";
import { authController } from "../controllers/auth.controller.js";

const router = express.Router();

router.post(
    "/login",
    withValidated(authController.login, { body: loginValidator }),
);

router.get("/refresh-token", authController.refreshTokens);

router.post("/logout", withAuthenticated(authController.logout));

export { router };
