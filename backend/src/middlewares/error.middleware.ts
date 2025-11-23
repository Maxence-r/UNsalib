import { logger } from "../utils/logger.js";
import { Request, Response, NextFunction } from "express";

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    statusCode: number;

    constructor(
        statusCode: number,
        message: string,
        stack = "",
    ) {
        super(message);
        this.statusCode = statusCode;

        if (stack) {
            this.stack = stack;
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
    let stack = "";
    let message = err.message;

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        stack = err.stack ?? "";
    }

    // Handle specific error types
    if (message.includes("alidation")) {
        message +=
            ": " +
            (JSON.parse(stack) as { field: string; message: string }[])
                .map((obj) => `${obj.message} for '${obj.field}' field`)
                .join(", ");
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
            stack: err.stack,
        }),
    });
}

export { errorHandler, ApiError };
