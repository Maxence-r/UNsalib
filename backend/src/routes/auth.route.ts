import express from "express";

import { loginValidator } from "../validators/auth.validator.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { authController } from "../controllers/auth.controller.js";
import { route } from "../utils/express/middleware.js";

const router = express.Router();

router.post(
    "/login",
    route()
        .use(authenticate)
        .use(validateBody, loginValidator)
        .handle(authController.login),
);

router.get("/refresh-token", authController.refreshTokens);

router.post("/logout", route().use(authenticate).handle(authController.logout));

export { router };
