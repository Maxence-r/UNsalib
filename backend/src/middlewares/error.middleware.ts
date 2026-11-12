import type { Request, Response, NextFunction } from "express";

import { logger } from "../utils/logger.js";
import { ServiceError, ApiError } from "../utils/errors.js";
import { sendErrorResponse } from "../utils/express/controller.js";

/**
 * Global error handler middleware
 */
function errorHandler(
    err: Error | ApiError | ServiceError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
): void {
    // Log error
    logger.error({
        message: err.message,
        ...(err instanceof ApiError &&
            err.details !== undefined &&
            err.details !== null && { details: err.details }),
        ...(err.stack && { stack: err.stack }),
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
    });

    // Set default status code
    let statusCode = 500;
    // Do not leak generic errors by default
    let message: string | undefined = undefined;
    let details: unknown = undefined;

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        details = err.details;
    } else if (err instanceof ServiceError) {
        statusCode = 400;
        message = err.message;
    }

    // Send error response
    sendErrorResponse(
        res,
        statusCode,
        message || "Internal server error",
        details,
    );
}

export { errorHandler };
