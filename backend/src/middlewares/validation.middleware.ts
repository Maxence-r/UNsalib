import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

import { ApiError } from "./error.middleware.js";

/**
 * Validate request using express-validator
 */
function validationHandler(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => {
            const e = error as {
                param?: string;
                path?: string;
                location?: string;
                msg: string;
            };
            return {
                field: e.path ?? e.param ?? e.location ?? "",
                message: e.msg,
            };
        });

        return next(
            new ApiError(
                400,
                "Validation failed",
                JSON.stringify(errorMessages),
            ),
        );
    }

    next();
}

export { validationHandler };
