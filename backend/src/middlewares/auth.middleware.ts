import { Request, Response, NextFunction } from "express";
import { ApiError } from "./error.middleware.js";
import { accountsService } from "services/accounts.service.js";

async function authHandler(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void | Response> {
    try {
        let token;

        // Check for token in headers
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // Check if token exists
        if (!token) {
            throw new ApiError(401, "Not authorized to access this route");
        }

        try {
            req.userId = await accountsService.getFromToken(token);

            if (!req.userId) {
                throw new ApiError(401, "User not found");
            }

            next();
        } catch {
            throw new ApiError(401, "Not authorized to access this route");
        }
    } catch (error) {
        next(error);
    }
}

export { authHandler };
