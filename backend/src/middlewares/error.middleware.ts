import { logger } from "../utils/logger.js";
import { Request, Response, NextFunction } from "express";
import type { ErrorRequestHandler } from "express";

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global error handler middleware
 */
function errorHandler(
    err: Error,
    req: Request,
    res: Response,
): void {
    let { statusCode, message } = err;

    // Log error
    logger.error("Error:", {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
    });

    // Handle specific error types
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }

    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyPattern)[0];
        message = `${field} already exists`;
    }

    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    // Set default status code if not set
    statusCode = statusCode || 500;

    // Send error response
    res.status(statusCode).json({
        success: false,
        message: message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
            error: err,
        }),
    });
}

export { errorHandler, ApiError };
