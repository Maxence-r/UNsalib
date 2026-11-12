import type { Request, Response, NextFunction } from "express";

import { logger } from "../utils/logger.js";
import { ServiceError, ApiError } from "../utils/errors.js";
import { appConfig } from "../configs/app.config.js";
import { sendErrorResponse } from "../utils/express/controller.js";

/**
 * Global error handler middleware
 */
function errorHandler(
    err: Error | ApiError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
): void {
    // Set default status code
    let statusCode = 500;
    const stack = err.stack ?? "";
    let message = err.message;

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
    } else if (err instanceof ServiceError) {
        statusCode = 400;
    } else if (!appConfig.isDevMode) {
        // Do not leak unexpected error messages in production
        message = "";
    }

    // Log error
    logger.error({
        message: message,
        stack: stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
    });

    // Send error response
    sendErrorResponse(
        res,
        statusCode,
        message || "Internal server error",
        appConfig.isDevMode ? stack : undefined,
    );
}

export { errorHandler };
