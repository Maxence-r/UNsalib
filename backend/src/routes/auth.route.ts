import express, { Request, Response, NextFunction } from "express";

import { loginValidation } from "../validators/auth.validator.js";
import { authHandler } from "../middlewares/auth.middleware.js";
import { validationHandler } from "../middlewares/validation.middleware.js";
import { authController } from "../controllers/auth.controller.js";

const router = express.Router();

// Public routes
router.post(
    "/login",
    loginValidation,
    validationHandler,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next),
);
router.get(
    "/refresh-token",
    (req: Request, res: Response, next: NextFunction) =>
        authController.refreshTokens(req, res, next),
);

// Private routes
router.get(
    "/logout",
    authHandler,
    (req: Request, res: Response, next: NextFunction) =>
        authController.logout(req, res, next),
);

export { router };
