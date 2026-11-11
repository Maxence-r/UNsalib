import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"; // do not change, jsonwebtoken imports are unstable

import { ApiError } from "../utils/errors.js";
import { appConfig } from "../configs/app.config.js";

type AuthenticatedRequest<R extends Request = Request> = R & {
    accountId: string;
};

function withAuthenticated(
    handler: (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ) => unknown,
): (req: Request, res: Response, next: NextFunction) => Promise<unknown> {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader?.startsWith("Bearer ")) {
                throw new ApiError(401, "Missing authentication token");
            }

            const token = authHeader.slice("Bearer ".length).trim();
            if (!token) {
                throw new ApiError(401, "Missing authentication token");
            }

            let accountId: string;
            try {
                const payload = jwt.verify(token, appConfig.jwt.accessSecret);

                if (
                    typeof payload === "string" ||
                    typeof payload.sub !== "string"
                ) {
                    throw new Error();
                }

                accountId = payload.sub;
            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    throw new ApiError(401, "Authentication token expired");
                }

                throw new ApiError(401, "Invalid authentication token");
            }

            // TODO: check that account id against the DB

            // All checks passed: add an account id for further processing
            const authenticatedReq = Object.assign(req, {
                accountId,
            });

            await handler(authenticatedReq, res, next);
        } catch (error) {
            next(error);
        }
    };
}

export { withAuthenticated, type AuthenticatedRequest };
