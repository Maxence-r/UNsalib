import type { Request, Response, NextFunction } from "express";

import { accountsService } from "../services/accounts.service.js";
import { appConfig } from "../configs/app.config.js";
import type { AuthenticatedRequest, ValidatedRequest } from "../utils/types/express.js";
import type { loginValidator } from "../validators/auth.validator.js";
import { ApiError } from "../utils/errors.js";

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
        req: ValidatedRequest<typeof loginValidator>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
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

            res.status(200).json({
                success: true,
                data: {
                    account: account,
                    accessToken: accessToken,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh access token using refresh token stored in a cookie (with rotation)
     */
    async refreshTokens(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (!req.cookies.refreshToken) {
                throw new ApiError(401, "Missing refresh token");
            }
            const oldRefreshToken = req.cookies.refreshToken as string;

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

            res.status(200).json({
                success: true,
                data: {
                    accessToken: accessToken,
                },
            });
        } catch (error) {
            // If rotation fails, token is invalid or reused so we invalidate session
            res.clearCookie("refreshToken");
            return next(error);
        }
    }

    /**
     * Logout user
     */
    async logout(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (req.cookies.refreshToken) {
                const refreshToken = req.cookies.refreshToken as string;
                await accountsService.logout(refreshToken);

                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: !appConfig.isDevMode,
                    sameSite: "strict",
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    message: "Logout successful",
                },
            });
        } catch (error) {
            next(error);
        }
    }
}

const authController = new AuthController();

export { authController };
