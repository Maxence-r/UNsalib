import jwt from "jsonwebtoken"; // do not change, jsonwebtoken imports are unstable

import { ApiError } from "../utils/errors.js";
import { appConfig } from "../configs/app.config.js";
import { middleware, type Middleware } from "../utils/express/middleware.js";

interface AuthenticatedFields {
    accountId: string;
}

function authenticate(): Middleware<AuthenticatedFields> {
    return middleware((req) => {
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

        return { accountId };
    });
}

export { authenticate, type AuthenticatedFields };
