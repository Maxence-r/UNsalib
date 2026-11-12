import type { Response } from "express";

function sendErrorResponse(
    res: Response,
    statusCode: number,
    message: string,
    details?: unknown,
): void {
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(details !== undefined && details !== null && { details }),
    });
}

function sendSuccessResponse(
    res: Response,
    statusCode: number,
    data?: unknown,
): void {
    res.status(statusCode).json({
        success: true,
        ...(data !== undefined && data !== null && { data }),
    });
}

export { sendSuccessResponse, sendErrorResponse };
