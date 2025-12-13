import { logger } from "../utils/logger.js";
import { Request, Response, NextFunction } from "express";

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    statusCode: number;
    validationStack?: { field: string; message: string }[];

    constructor(
        statusCode: number,
        message: string,
        validationStack?: { field: string; message: string }[],
    ) {
        super(message);
        this.statusCode = statusCode;

        if (validationStack) {
            this.validationStack = validationStack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

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
        if (err.validationStack) {
            // Handle validation errors
            message +=
                ": " +
                err.validationStack
                    .map((obj) => `${obj.message} for '${obj.field}' field`)
                    .join(", ");
        }
    } else if (process.env.NODE_ENV !== "development") {
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
    res.status(statusCode).json({
        success: false,
        message: message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && {
            stack: stack,
        }),
    });
}

export { errorHandler, ApiError };
