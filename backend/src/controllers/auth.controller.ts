import type { Request, Response } from "express";

import { accountsService } from "../services/accounts.service.js";
import { appConfig } from "../configs/app.config.js";
import type { AuthenticatedFields } from "../middlewares/auth.middleware.js";
import type { ValidatedFields } from "../middlewares/validation.middleware.js";
import type { loginValidator } from "../validators/auth.validator.js";
import { ApiError } from "../utils/errors.js";
import { sendSuccessResponse } from "../utils/express/controller.js";

class AuthController {
    constructor() {
        this.login = this.login.bind(this);
        this.refreshTokens = this.refreshTokens.bind(this);
        this.logout = this.logout.bind(this);
    }

    /**
     * Login user
     */
    async login(
        req: Request & ValidatedFields<typeof loginValidator>,
        res: Response,
    ): Promise<void> {
        const { account, accessToken, refreshToken } =
            await accountsService.login(
                req.validated.username,
                req.validated.password,
            );

        // Set refresh token in HttpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: !appConfig.isDevMode,
            sameSite: "strict",
            maxAge: appConfig.jwt.refreshExpire * 1000,
        });

        sendSuccessResponse(res, 200, {
            account,
            accessToken,
        });
    }

    /**
     * Refresh access token using refresh token stored in a cookie (with rotation)
     */
    async refreshTokens(req: Request, res: Response): Promise<void> {
        try {
            if (
                !req.cookies.refreshToken ||
                typeof req.cookies.refreshToken !== "string"
            ) {
                throw new ApiError(401, "Missing refresh token");
            }
            const oldRefreshToken = req.cookies.refreshToken;

            // Rotate refresh token and get a new access token
            const { accessToken, refreshToken } =
                await accountsService.refreshTokens(oldRefreshToken);

            // Set new rotated refresh token
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: !appConfig.isDevMode,
                sameSite: "strict",
                maxAge: appConfig.jwt.refreshExpire * 1000,
            });

            sendSuccessResponse(res, 200, {
                accessToken,
            });
        } catch (error) {
            // If rotation fails, token is invalid or reused so we invalidate session
            res.clearCookie("refreshToken");
            throw error;
        }
    }

    /**
     * Logout user
     */
    async logout(
        req: Request & AuthenticatedFields,
        res: Response,
    ): Promise<void> {
        if (req.cookies.refreshToken) {
            const refreshToken = req.cookies.refreshToken as string;
            await accountsService.logout(refreshToken);

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: !appConfig.isDevMode,
                sameSite: "strict",
            });
        }

        sendSuccessResponse(res, 200);
    }
}

const authController = new AuthController();

export { authController };
