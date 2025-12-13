import { Request, Response, NextFunction } from "express";
import { matchedData } from "express-validator";

import { accountsService } from "../services/accounts.service.js";
import { ApiError } from "../middlewares/error.middleware.js";
import { config } from "configs/app.config.js";

class AuthController {
    /**
     * @route   POST /auth/login
     * @desc    Login user
     * @access  Public
     */
    async login(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            // Getting validated body
            const data: {
                username: string;
                password: string;
            } = matchedData(req);

            const { account, accessToken, refreshToken } =
                await accountsService.login(data.username, data.password);

            // Set refresh token in HttpOnly cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: config.jwt.refreshExpire,
            });

            res.status(200).json({
                account: account,
                accessToken: accessToken,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /auth/refresh-token
     * @desc    Refresh access token using refresh token stored in a cookie (with rotation)
     * @access  Public
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
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: config.jwt.refreshExpire,
            });

            res.status(200).json({
                success: true,
                accessToken: accessToken,
            });
        } catch (error) {
            // If rotation fails, token is invalid or reused so we invalidate session
            res.clearCookie("refreshToken");
            return next(error);
        }
    }

    /**
     * @route   POST /auth/logout
     * @desc    Logout user
     * @access  Private
     */
    async logout(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (req.cookies.refreshToken) {
                const refreshToken = req.cookies.refreshToken as string;
                await accountsService.logout(refreshToken);

                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });
            }

            res.status(200).json({
                success: true,
                message: "Logout successful",
            });
        } catch (error) {
            next(error);
        }
    }
}

const authController = new AuthController();

export { authController };
