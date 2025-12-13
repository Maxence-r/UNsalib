import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { ApiError } from "./error.middleware.js";
import { config } from "../configs/app.config.js";

interface AccessTokenPayload extends JwtPayload {
    sub: string;
}

/**
 * Athentication middleware for private routes
 */
function authHandler(req: Request, res: Response, next: NextFunction): void {
    try {
        // Check for token in headers
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new ApiError(401, "Missing or invalid Authorization header");
        }

        // Get the token
        const accessToken = authHeader.split(" ")[1];

        // Check if the token is valid
        let payload: AccessTokenPayload;
        try {
            payload = jwt.verify(
                accessToken,
                config.jwt.accessSecret,
            ) as AccessTokenPayload;
        } catch (err: unknown) {
            if ((err as Error).name === "TokenExpiredError") {
                throw new ApiError(401, "Access token expired");
            }
            throw new ApiError(401, "Invalid access token");
        }

        // Check if the token includes an account id
        if (!payload.sub) {
            throw new ApiError(401, "Invalid access token payload");
        }

        // All checks passed: add an account id for further processing
        req.accountId = payload.sub;
        next();
    } catch (error) {
        next(error);
    }
}

export { authHandler };
